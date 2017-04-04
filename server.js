var run = require('./run');
var fs = require('fs');
var path = require('path');

run("sample/",  {
    services: [
        {
            model: 'logic/model/weather-report',
            service: 'logic/service/weather-service',
            name: "WeatherService"
        }
    ],
    key: fs.readFileSync(path.join(__dirname, '/certs/localhost.key')),
    cert: fs.readFileSync(path.join(__dirname, '/certs/localhost.crt'))
});