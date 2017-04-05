
var http2 = require('http2');
var Require = require('mr/bootstrap-node');

module.exports = function run(module, opts) {
    return Require.loadPackage(".").then(function (acceleratorRequire) {
        return acceleratorRequire.async('./accelerator').then(function (Accelerator) {

            var accelerator = new Accelerator(module, opts);

            return accelerator.initModule().then(function (moduleRequire) {
                return accelerator.initServices().then(function () {

                    var server = http2.createServer(opts, function (request, response) {

                        // fetchData
                        if (request.method === 'POST' && request.url === '/fetchData') {
                            return accelerator.fetchData(request, response).catch(function (err) {
                                console.error(err);
                                console.error(err.stack);
                                response.writeHead(500);
                                response.end(err.message);
                            });

                        // Get current module
                        } else if (request.method === 'GET' && request.url === '/module') {
                            response.writeHead(200);
                            response.end(moduleRequire.config.name);

                        // Get current services
                        } else if (request.method === 'GET' && request.url === '/services') {
                            response.writeHead(200);
                            response.end(JSON.stringify(opts.services));
                        } else {
                            response.writeHead(404);
                            response.end();
                        }
                    });

                    server.listen(8080);

                    return accelerator;
                });
            });
        });
    });
}