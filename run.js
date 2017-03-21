global.XMLHttpRequest = require('xhr2');

var DataService = require("montage-data/logic/service/data-service").DataService,
    DataSelector = require("montage-data/logic/service/data-selector").DataSelector
    Criteria = require("montage/core/criteria").Criteria,
    WeatherReport = require("test/spec/logic/model/weather-report").WeatherReport,
    WeatherService = require("test/spec/logic/service/weather-service").WeatherService,
    MontageSerializer = require("montage/core/serialization/serializer/montage-serializer").MontageSerializer;


var dataExpression = "city = $city && unit = $unit && country = $country";
var dataParameters = {
    city: 'San-Francisco',
    country: 'us',
    unit: 'imperial'
};
var dataCriteria = new Criteria().initWithExpression(dataExpression, dataParameters);
var dataType = WeatherReport.TYPE;
var dataQuery  = DataSelector.withTypeAndCriteria(dataType, dataCriteria);

/*
var s = new MontageSerializer().initWithRequire(require);
var dataQueryJson = s.serializeObject(dataQuery);
console.log(dataQueryJson);
*/

var mainService = new DataService();
mainService.addChildService(new WeatherService());
return mainService.fetchData(dataQuery).then(function (weatherReports) {
	return weatherReports;
});
  
