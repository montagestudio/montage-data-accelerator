
// Execute
var mrRequire = require('mr/bootstrap-node');
var PATH = require("path");
mrRequire.loadPackage(PATH.join(__dirname, "/..")).then(function (mr) {
	return mr.async('test/spec/serialize');
});