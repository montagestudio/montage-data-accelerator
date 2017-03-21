var fs = require('fs');
var path = require('path');
var http2 = require('http2');
var Require = require('mr/bootstrap-node');

server = http2.createServer({
    key: fs.readFileSync(path.join(__dirname, '/test/localhost.key')),
    cert: fs.readFileSync(path.join(__dirname, '/test/localhost.crt'))
}, function (request, response) {
	
	Require.loadPackage(".").then(function (mr) {
		return mr.async('run').then(function (result) {
			response.setHeader('content-type', 'application/json');
			response.writeHead(200);
			response.end(JSON.stringify(result));
		});
	}).catch(function (err) {
		console.error(err);
		response.writeHead(500);
		response.end(err.message);
	});
});

server.listen(8080);
