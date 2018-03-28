/* global module, require, Promise */

var http = require('http');
var Require = require('mr/bootstrap-node');
var fs = require('fs');
var path = require('path');
var mime = require('mime-types');

// Retrieve POST payload from http2 request
function getRequestPayload(stream) {
  return new Promise(function (resolve, reject) {
        var str = '';
        stream.on('data', function(chunk) {
            str += chunk;
        });
        stream.on('end', function() {
            resolve(decodeURIComponent(str));
        });
        stream.on('error', reject);
  });
}

function readFile(path) {
    return new Promise(function(resolve, reject) {
        fs.readFile(path, function(err, file) {
            if (err) {
                reject(err);
            } else {
                resolve(file);
            }
        });
    });
}
function getMineType(fileLocation) {
    return mime.contentType(path.extname(fileLocation.replace('.min.js', '.js')));
}

function stripTrailingSlash(str) {
    if(str.substr(-1) === '/') {
        str = str.substr(0, str.length - 1);
    }
    return str.replace('file:///', '/');
}

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
                    var server = http.createServer(function (request, response) {

                        var moduleLocation = stripTrailingSlash(moduleRequire.config.location);

                        console.log(moduleRequire.config.name, moduleLocation);

                        // Handle accelerator request
                        console.log(request.method, request.url);

                        // Perform fetchData from request payload serialized DataQuery
                        if (request.method === 'POST' && request.url === '/api/fetchData') {
                            getRequestPayload(request).then(function (query) {
                                return accelerator.fetchData(query).then(function (result) {
                                    response.setHeader('content-type', 'application/json');
                                    response.setHeader('Access-Control-Allow-Origin', '*');
                                    response.writeHead(200);
                                    response.end(JSON.stringify(result, null, 2));
                                });
                            }).catch(function (err) {
                                console.error(err);
                                console.error(err.stack);
                                response.writeHead(500);
                                response.end(err.message);
                            });

                        // Get current module
                        } else if (request.method === 'GET' && request.url === '/api/module') {
                            response.writeHead(200);
                            response.end(JSON.stringify(moduleRequire.config, null, 2));

                        // Get current services
                        } else if (request.method === 'GET' && request.url === '/api/services') {
                            response.writeHead(200);
                            response.end(JSON.stringify(opts.services));

                        } else if (request.method === 'GET' && request.url === '/' || request.url === '') {

                            // Render index.html and push montage.js
                            Promise.all([
                                readFile(moduleLocation + '/index.html'),
                                readFile(moduleLocation + '/node_modules/montage/montage.js'),
                                readFile(moduleLocation + '/package.json'),
                                readFile(moduleLocation + '/node_modules/montage/node_modules/bluebird/js/browser/bluebird.min.js'),
                            ]).then(function(files) {

                                // Does the browser support push?
                                if (0 && response.push) {

                                    // The JS file
                                    var montagePush = response.push('/node_modules/montage/montage.js', {
                                        req: {
                                            'accept': '**/*'
                                        },
                                        res: {
                                            'content-type': 'application/javascript'
                                        }
                                    });

                                    montagePush.on('error', function(err) {
                                        console.error(err);
                                    });

                                    montagePush.end(files[1]);

                                    // The Package file
                                    var pkgPush = response.push('/package.json', {
                                        req: {
                                            'accept': '**/*'
                                        },
                                        res: {
                                            'content-type': 'application/json'
                                        }
                                    });

                                    pkgPush.on('error', function(err) {
                                        console.error(err);
                                    });

                                    pkgPush.end(files[2]);

                                    // The Package file
                                    var pkgPush = response.push('/node_modules/montage/node_modules/bluebird/js/browser/bluebird.min.js', {
                                        req: {
                                            'accept': '**/*'
                                        },
                                        res: {
                                            'content-type': 'application/javascript'
                                        }
                                    });

                                    pkgPush.on('error', function(err) {
                                        console.error(err);
                                    });

                                    pkgPush.end(files[3]);
                                }

                                response.writeHead(200);
                                response.end(files[0]);

                            }).catch(function(err) {
                                console.error(err);
                                console.error(err.stack);
                                response.writeHead(500);
                                response.end(err.message);
                            });
                        } else {

                            var filename = moduleLocation + '/' + request.url;

                            if (fs.existsSync(filename) && fs.statSync(filename).isFile()) {
                                response.writeHead(200);
                                var fileStream = fs.createReadStream(filename);
                                fileStream.pipe(response);
                                fileStream.on('finish',response.end);
                            } else {

                                response.writeHead(404);
                                response.end();  
                            }
                        }
                    });

                    server.listen(8080);

                    return accelerator;
                });
            });
        });
    });
};
