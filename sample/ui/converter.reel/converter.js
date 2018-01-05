/**
 * @module ui/converter.reel
 */
var Component = require("montage/ui/component").Component;
var Criteria = require("montage/core/criteria").Criteria;
var WeatherReport = require("logic/model/weather-report").WeatherReport;
var WeatherReportType = require("logic/model/weather-report").Type;
var WeatherService = require("logic/service/weather-service").WeatherService;
var RemoteDataService = require("logic/service/remote-data-service").RemoteDataService;
var DataService = require("montage/data/service/data-service").DataService;
var DataSelector = require("montage/data/service/data-selector").DataSelector;

/**
 * @class Converter
 * @extends Component
 */
exports.Converter = Component.specialize(/** @lends Converter# */ {
    constructor: {
        value: function Converter() {
            var that = this;
            this.super();

            var mainService = new DataService();
            //mainService.addChildService(new RemoteDataService());
            mainService.addChildService(new WeatherService());

            var dataExpression = "city = $city && unit = $unit && country = $country";
            var dataParameters = {
                city: 'San-Francisco',
                country: 'us',
                unit: 'imperial'
            };

            var dataCriteria = new Criteria().initWithExpression(dataExpression, dataParameters);
            var dataType = WeatherReport;
            var dataQuery  = DataSelector.withTypeAndCriteria(dataType, dataCriteria);
            mainService.fetchData(dataQuery).then(function (weatherReports) {
                that.weatherReport = weatherReports[0];
            });
        }
    },

    _weatherReport: {
        value: null,
    },

    weatherReport: {
        get: function () {
            return this._weatherReport;
        },
        set: function (weatherReport) {
            if (this._weatherReport !== weatherReport) {
                this._weatherReport = weatherReport;
                this.needsDraw = true;
            }
        }
    }
});
