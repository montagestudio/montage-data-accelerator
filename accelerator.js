// Montage Accelerator env
var URL = require('url');
global.XMLHttpRequest = require('xhr2');
var Require = require('mr/bootstrap-node');

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


/**
 * Create an Accelerator for a given MontageModule.
 *
 * @param {String} tagName - the path of the montage module to load.
 * @param {Object} [opts] - attributes hash or a name/value pair.
 * @returns {Accelerator} the new Accelerator instance.
 *
 * @constructs Accelerator
 * @memberof module:contour-data-accelerator/Accelerator
 */
function Accelerator(module, opts) {
    this.module = module;
    this.opts = opts;
}

Accelerator.prototype = {

    /**
     * MontageRequire instance.
     * @type {Object}
     */
    moduleRequire: null,

    /**
     * MontageDate/DataService instance
     * @type {Object}
     */
    mainService: null,

    /**
     * Load accelerated module and set MontageRequire instance.
     */
    initModule: function () {
        var that = this;
        return Require.loadPackage(this.module).then(function (moduleRequire) {
            that.moduleRequire = moduleRequire;
            return that.moduleRequire;
        });
    },

    /**
     *
     */
    initServices: function () {
        var mr = this.moduleRequire,
            servicesModules = this.opts.services || [];
        return this.getMainService().then(function (mainService) {
            return Promise.all(servicesModules.map(function (serviceModule) {
                return mr.async(serviceModule.model).then(function (module) {
                    return mr.async(serviceModule.service).then(function (module) {
                        var service = new module[serviceModule.name]();
                        return mainService.addChildService(service);
                    });
                });
            }));
        });
    },

    //
    //
    //

    /**
     * Get MainService instance.
     * @return Promise[mainService]
     */
    getMainService: function () {
        var that = this,
            mr = this.moduleRequire;

        if (that.mainService) {
            return Promise.resolve(that.mainService);
        } else {
            return mr.async("montage-data/logic/service/data-service").then(function (module) {
                var DataService = module.DataService;
                that.mainService = new DataService();
                return that.mainService;
            });
        }
    },

    /**
     * 
     */
    getDataQuery: function (query) {
        var mr = this.moduleRequire; 
        return mr.async("montage-data/logic/service/data-selector").then(function (module) {
            var DataSelector = module.DataSelector;
            return mr.async("montage/core/criteria").then(function (module) {
                var Criteria = module.Criteria;
                return mr.async('montage/core/serialization/deserializer/montage-deserializer').then(function (module) {
                    return module.deserialize(query, mr); 
                });
            });
        });
    },

    //
    //
    //

    /**
     * Perform fetchData from request payload serialized DataQuery
     * @return Promise[DataService.fetchData()]
     */
    fetchData: function (req, res) {

        var that = this,
            mainService = that.mainService;

        return getRequestPayload(req).then(function (query) {
            return that.getDataQuery(query).then(function (dataQuery) {
                return mainService.fetchData(dataQuery);
            });
        });
    }
};

module.exports = Accelerator;