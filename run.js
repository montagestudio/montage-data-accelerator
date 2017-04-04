
var http2 = require('http2');
var Require = require('mr/bootstrap-node');

module.exports = function run(module, opts) {
    return Require.loadPackage(".").then(function (acceleratorRequire) {
        return acceleratorRequire.async('./accelerator').then(function (Accelerator) {
            return Require.loadPackage(module).then(function (moduleRequire) {

                var accelerator = new Accelerator(moduleRequire, opts);
                return accelerator.initServices().then(function () {

                    var server = http2.createServer(opts, function (request, response) {

                        // TODO dispatch to accelerator
                        return accelerator.fetchData(request, response).catch(function (err) {
                            console.error(err);
                            console.error(err.stack);
                            response.writeHead(500);
                            response.end(err.message);
                        });
                    });
                    return server.listen(8080);
                });
            });
        });
    });

}