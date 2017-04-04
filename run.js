
var http2 = require('http2');
var Require = require('mr/bootstrap-node');

module.exports = function run(module, opts) {
    return Require.loadPackage(".").then(function (acceleratorRequire) {
        return acceleratorRequire.async('./accelerator').then(function (Accelerator) {

            var accelerator = new Accelerator(module, opts);

            return accelerator.initModule().then(function () {
                return accelerator.initServices().then(function () {

                    var server = http2.createServer(opts, function (request, response) {

                        // TODO dispatch to accelerator routes
                        console.log(request.url)

                        return accelerator.fetchData(request, response).catch(function (err) {
                            console.error(err);
                            console.error(err.stack);
                            response.writeHead(500);
                            response.end(err.message);
                        });
                    });

                    server.listen(8080);

                    return accelerator;
                });
            });
        });
    });
}