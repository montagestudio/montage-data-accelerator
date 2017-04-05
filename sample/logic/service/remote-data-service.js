var HttpService = require("montage-data/logic/service/http-service").HttpService,
    DataObjectDescriptor = require("montage-data/logic/model/data-object-descriptor").DataObjectDescriptor,
    serialize = require("montage/core/serialization/serializer/montage-serializer").serialize,
    deserialize = require("montage/core/serialization/deserializer/montage-deserializer").deserialize;

/**
 * Provides area briefs data for Contour applications.
 *
 * @class
 * @extends external:DataService
 */
exports.RemoteDataService = HttpService.specialize({

    ENDPOINT: {
        value: 'https://localhost:8080'
    },

    fetchRawData: {
        value: function (stream) {
            return this.fetchRawDataWithBody(stream);
        }
    },

    mapFromRawData: {
        value: function (object, rawData, criteria) {
            object.temp = rawData[0].temp;
        }
    },

    fetchRawDataWithBody: {
        value: function (stream) {
            var self = this,
                criteria = stream.selector.criteria,
                type = stream.selector.type,
                selector = stream.selector;

            var url = self.ENDPOINT + '/fetchData',
                body = this._getQuery(criteria, type, selector);

            return self.fetchHttpRawData(url, null, body, false).then(function (data) {
                if (data) {
                    self.addRawData(stream, [data], criteria);
                    self.rawDataDone(stream);
                }
            }); 
        }
    },

    _getQuery: {
        value: function (criteria, type, selector) {
            var that = this,
                dataQueryJson = serialize(selector, require);

            // Debug serialize
            //sconsole.log(dataQueryJson);

            // Test deserialize
            deserialize(dataQueryJson, require).then(function (dataQuery) {
                //console.log(dataQuery);
            });

            return encodeURIComponent(dataQueryJson);
        },
    }
});
