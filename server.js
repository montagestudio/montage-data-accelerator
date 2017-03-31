var fs = require('fs');
var path = require('path');
var http2 = require('http2');
var Require = require('mr/bootstrap-node');
global.XMLHttpRequest = require('xhr2');

server = http2.createServer({
    key: fs.readFileSync(path.join(__dirname, '/certs/localhost.key')),
    cert: fs.readFileSync(path.join(__dirname, '/certs/localhost.crt'))
}, function (request, response) {
    Require.loadPackage(".").then(function (mr) {
        return mr.async('accelerator').then(function (accelerator) {
            return accelerator.fetchData(request, response);
        });
    }).catch(function (err) {
        console.error(err);
        console.error(err.stack);
        response.writeHead(500);
        response.end(err.message);
    });
});

server.listen(8080);
