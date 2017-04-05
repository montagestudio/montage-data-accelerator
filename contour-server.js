var run = require('./run');
var fs = require('fs');
var path = require('path');

var acceleratedModule = path.join(__dirname, '/../../tmp/contour-framework/'),
    acceleratedOptions = {
        key: fs.readFileSync(path.join(__dirname, '/certs/localhost.key')),
        cert: fs.readFileSync(path.join(__dirname, '/certs/localhost.crt')),
        services: [
            {
                model: 'logic/model/hazard',
                service: 'logic/service/hazard-service',
                name: "HazardService"
            }
        ]
    };

module.exports = run(acceleratedModule,  acceleratedOptions).then(function (accelerator) {
    console.log('data-accelerator started.', accelerator.module);
}, function (err) {
    console.log('data-accelerator error', err, err.stack);
});