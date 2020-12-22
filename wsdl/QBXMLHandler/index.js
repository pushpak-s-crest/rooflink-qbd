var data2xml = require('data2xml');
var convert = data2xml({
	xmlHeader: '<?xml version="1.0" encoding="utf-8"?>\n<?qbxml version="13.0"?>\n'
});
const fs = require('fs');
const path = require('path');

let rawData = fs.readFileSync(path.resolve(__dirname, 'data.json'));
let student = JSON.parse(rawData);

// Public
module.exports = {

	/**
	 * Builds an array of qbXML commands
	 * to be run by QBWC.
	 *
	 * @param callback(err, requestArray)
	 */
	fetchRequests: function (callback) {
    	console.log("🚀 ~ file: index.js ~ line 21 ~ fetchRequests")
		
		buildRequests(callback);
	},

	/**
	 * Called when a qbXML response
	 * is returned from QBWC.
	 *
	 * @param response - qbXML response
	 */
	handleResponse: function (response) {
    	console.log("🚀 ~ file: index.js ~ line 33 ~ response", response)
		console.log(response);
	},

	/**
	 * Called when there is an error
	 * returned processing qbXML from QBWC.
	 *
	 * @param error - qbXML error response
	 */
	didReceiveError: function (error) {
    	console.log("🚀 ~ file: index.js ~ line 44 ~ error", error)
		console.log(error);
	}
};

function buildRequests(callback) {
	var requests = new Array();
	requests.push(student)
	var xml = convert(
		'QBXML',
		{
			QBXMLMsgsRq: {
				_attr: { onError: 'stopOnError' },
				VendorAddRq : requests
			},
		}
	);
	console.log("🚀 ~ file: index.js ~ line 54 ~ buildRequests ~ student", student)
    console.log("🚀 ~ file: index.js ~ line 56 ~ buildRequests ~ xml", xml)
	requests.push(xml);

	return callback(null, requests);
}