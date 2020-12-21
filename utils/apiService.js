const axios = require("axios");

// to be read from env
const CSRF_COOKIE = "_csrf";
const SESSION_COOKIE = "_sid";

/** To be replaced by your token store mechanism */
class TokenStore {
  constructor() {
    this.store = {};
  }

  saveToken = (key, value) => {
    this.store[key] = value;
  };

  getToken = (key) => {
    return this.store[key];
  };

  deleteToken = (key) => {
    delete this.store[key];
  };

  deleteAll = () => {
    this.store = {};
  };
}

/** ApiService client */
class ApiService {
  constructor() {
    // instantiate your token store here
    this.tokenStore = new TokenStore();

    // Create axios session
    this.session = axios.create({
      // to be read from env
      baseURL: "https://www.roof.link",
      withCredentials: true,
    });

    // set headers before executing every request
    this.session.interceptors.request.use(
      async (config) => {
        if (config.headers) {
          return {
            ...config,
            headers: await this._prepareReqHeaders(),
          };
        }
        return Promise.resolve(config);
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // sync cookies on response
    this.session.interceptors.response.use(
      async (response) => {
        await this._syncCookies(response);
        return Promise.resolve(response);
      },
      (error) => {
        return Promise.reject(error.response.data);
      }
    );
  }

  _prepareReqHeaders = async () => {
    const csrf = await this._getCookie(CSRF_COOKIE);
    const sid = await this._getCookie(SESSION_COOKIE);

    let headers = {
      "X-Requested-With": "XMLHttpRequest",
    };
    if (csrf) {
      headers = {
        ...headers,
        "X-CSRFToken": csrf,
      };
    }
    if (sid && csrf) {
      headers = {
        ...headers,
        Cookie: `${SESSION_COOKIE}=${sid}; ${CSRF_COOKIE}=${csrf}`,
      };
    }
    return headers;
  };

  _extractCookieValue = (cookies, name) => {
    let input = cookies[0];
    if (cookies[1] && cookies[1].includes(name)) {
      input = cookies[1];
    }
    const value = input.match(`${name}=(.*?);`);
    return value ? value[1] : null;
  };

  _syncCookies = async (response) => {
    if ("set-cookie" in response.headers) {
      const cookies = response.headers["set-cookie"];
      const sessionCookie = this._extractCookieValue(cookies, SESSION_COOKIE);
      const csrfCookie = this._extractCookieValue(cookies, CSRF_COOKIE);
      if (sessionCookie) {
        // your method to store session cookie
        this.tokenStore.saveToken(SESSION_COOKIE, sessionCookie);
      }
      if (csrfCookie) {
        // your method to store csrf cookie
        this.tokenStore.saveToken(CSRF_COOKIE, csrfCookie);
      }
    }
  };

  _getCookie = async (cookieName) => {
    // your method to extract cookie from where you are saving it
    return this.tokenStore.getToken(cookieName);
  };

  deleteAllCookies = async () => {
    // return AsyncStorage.clear();
    // your method to delte cookie
    this.tokenStore.deleteAll();
  };

  get = async (url, params = {}) => this.session.get(url, { params });

  options = async (url, params = {}) => this.session.options(url, { params });

  post = async (url, body = {}, params = {}) => {
    return this.session.post(url, body, { params });
  };

  patch = async (url, body = {}, params = {}) => {
    return this.session.patch(url, body, { params });
  };

  delete = async (url, params = {}) => {
    return this.session.delete(url, { params });
  };
}

const apiService = new ApiService();

module.exports = apiService;
