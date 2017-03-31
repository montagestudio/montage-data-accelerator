// Montage Accelerator env
var URL = require('url'),
	DataService = require("montage-data/logic/service/data-service").DataService,
    MontageSerializer = require("montage/core/serialization/serializer/montage-serializer").MontageSerializer;

function getQueryFromUrl(query) {
  var result = {};
  if (query) {
	  query.split("&").forEach(function(part) {
	    var item = part.split("=");
	    result[item[0]] = decodeURIComponent(item[1]);
	  });	
  }
  return result;
}

// Create dataQuery from serailized payload
function getDataQueryFromQuery(require, query) {

	// TODO require for deserialize to resolve path, use params ?
    var DataSelector = require("montage-data/logic/service/data-selector").DataSelector
    	Criteria = require("montage/core/criteria").Criteria,
    	WeatherReport = require("logic/model/weather-report").WeatherReport,
    	WeatherService = require("logic/service/weather-service").WeatherService;

	return require.async('montage/core/serialization/deserializer/montage-deserializer').then(function (module) {
		return module.deserialize(query, require);
	});
}

// create an instance of DataSelector using basic serialiation
function getDataQueryFromParams(require, query) {
	return require.async("montage-data/logic/service/data-selector").then(function (module) {
		var DataSelector = module.DataSelector;
		return require.async("montage/core/criteria").then(function (module) {
			var Criteria = module.Criteria;
			return require.async(query.module).then(function (module) {
				var dataType = module[query.moduleName].TYPE;
				var dataParams = JSON.parse(query.parameters);
				var dataExpression = query.expression;
				var dataCriteria = new Criteria().initWithExpression(dataExpression, dataParams);
				var dataQuery = DataSelector.withTypeAndCriteria(dataType, dataCriteria);			
				return dataQuery;
			});
		});
	});
}
exports.fetchData = function (req, res) {

	var url = URL.parse(req.url),
		params = getQueryFromUrl(url.query);

	var promise; 
	if (params.query) {
		promise = getDataQueryFromQuery(require, params.query);
	} else {
		promise = getDataQueryFromParams(require, params);
	}

	return promise.then(function (dataQuery) {

		var mainService = new DataService();

		// TODO add service params
    	WeatherService = require("logic/service/weather-service").WeatherService;
		mainService.addChildService(new WeatherService());

		return mainService.fetchData(dataQuery).then(function (result) {
			res.setHeader('content-type', 'application/json');
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.writeHead(200);
			res.end(JSON.stringify(result));
		});
	});
};