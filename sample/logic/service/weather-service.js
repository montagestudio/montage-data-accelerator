var HttpService = require("montage/data/service/http-service").HttpService,
    DataService = require("montage/data/service/data-service").DataService,
    DataSelector = require("montage/data/service/data-selector").DataSelector,
    WeatherReport = require("../model/weather-report").WeatherReport;

/**
 * Provides area briefs data for Contour applications.
 *
 * @class
 * @extends external:DataService
 */
 var WeatherService = exports.WeatherService = HttpService.specialize(/** @lends AreaBriefService.prototype */ {

    API_KEY: {
        value: '5ad6d34065ff5e9741f15dadac0ace9a'
    },

    ENDPOINT: {
        value: 'https://api.openweathermap.org/data/2.5/'
    },

   
    fetchRawData: {
        value: function (stream) {
            var self = this,
                criteria = stream.selector.criteria;

            return self.fetchHttpRawData(this._getUrl(criteria, true), false).then(function (data) {
                if (data) {
                    self.addRawData(stream, [data], criteria);
                    self.rawDataDone(stream);
                }
            });
        }
    },

    mapFromRawData: {
        value: function (object, rawData, criteria) {
            object.temp = rawData.main.temp;
        }
    },

    _getUrl: {
        value: function (criteria, detect) {
            var parameters = criteria.parameters;
            return this.ENDPOINT + "weather?q=" + parameters.city + "," + parameters.country + "&units=" + parameters.unit + "&appid=" + this.API_KEY;
        }
    }
});