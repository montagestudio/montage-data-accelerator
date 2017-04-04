global.XMLHttpRequest = require('xhr2');

var DataService = require("montage-data/logic/service/data-service").DataService,
    DataSelector = require("montage-data/logic/service/data-selector").DataSelector
    Criteria = require("montage/core/criteria").Criteria,
    WeatherService = require("sample/logic/service/weather-service").WeatherService;
	deserialize = require("montage/core/serialization/deserializer/montage-deserializer").deserialize;

var test = JSON.stringify(require('./query.json'));
console.log(test);
deserialize(test, require).then(function (dataQuery) {

	var mainService = new DataService();
	mainService.addChildService(new WeatherService());
	mainService.fetchData(dataQuery).then(function (res) {
		console.log(res);
	});
});