/*global require, module, process, console, __dirname */

// Execute
var mrRequire = require('mr/bootstrap-node');
var PATH = require("path");
mrRequire.loadPackage(PATH.join(__dirname, "/..")).then(function (mr) {
	return mr.async('test/spec/contour-framework/serialize');
});