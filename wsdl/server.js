const fs = require("fs");
const path = require("path");
var soap = require('soap');
const WSDL_FILENAME = 'qbws.wsdl';

const getWsdl = () => {
	var wsdl = fs.readFileSync(path.join(__dirname, WSDL_FILENAME), 'utf8');
	return wsdl;
}

class Server {
	constructor(server) {
		this.wsdl = getWsdl();
		this.webService = require('./web-service');
		this.server = server;
	}

	run = () => {
		var soapServer = soap.listen(this.server, '/wsdl', this.webService.service, this.wsdl);
		console.log('Quickbooks SOAP Server listening...');
	}

	setQBXMLHandler = (qbXMLHandler) => {
		this.webService.setQBXMLHandler(qbXMLHandler);
	};
}

module.exports = Server;
