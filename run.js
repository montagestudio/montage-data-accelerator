
var http2 = require('http2');
var Require = require('mr/bootstrap-node');

module.exports = function run(module, opts) {
    // Load contour-data-accelerator
    return Require.loadPackage(".").then(function (acceleratorRequire) {
        // Load accelerator module
        return acceleratorRequire.async('./accelerator').then(function (Accelerator) {
            // Create Accelerator insatnce
            var accelerator = new Accelerator(module, opts);
            // Init accelerated Module
            return accelerator.initModule().then(function (moduleRequire) {
                // Init accelerated services
                return accelerator.initServices().then(function () {
                    // Start HTTP2 Server
                    var server = http2.createServer(opts, function (request, response) {

                        // Handle accelerator reqeust

                        // TODO
                        // - express style

                        // Perform fetchData from request payload serialized DataQuery
                        if (request.method === 'POST' && request.url === '/fetchData') {
                            accelerator.fetchData(request, response).then(function (result) {
                                response.setHeader('content-type', 'application/json');
                                response.setHeader('Access-Control-Allow-Origin', '*');
                                response.writeHead(200);
                                response.end(JSON.stringify(result));

                            }).catch(function (err) {
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