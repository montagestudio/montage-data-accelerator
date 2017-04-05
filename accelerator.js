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

// Create dataQuery from serailized payload
function getDataQueryFromQuery(mr, query) {
    return mr.async("montage-data/logic/service/data-selector").then(function (module) {
        var DataSelector = module.DataSelector;
        return mr.async("montage/core/criteria").then(function (module) {
            var Criteria = module.Criteria;
            return mr.async('montage/core/serialization/deserializer/montage-deserializer').then(function (module) {
                return module.deserialize(query, mr); 
            });
        });
    });
}

function Accelerator(module, opts) {
    this.module = module;
    this.opts = opts;
}

Accelerator.prototype = {

    moduleRequire: null,

    mainService: null,

    initModule: function () {
        var that = this;
        return Require.loadPackage(this.module).then(function (moduleRequire) {
            that.moduleRequire = moduleRequire;
            return that.moduleRequire;
        });
    },

    getMainService: function () {
        var that = this,
            moduleRequire = this.moduleRequire;

        if (that.mainService) {
            return Promise.resolve(that.mainService);
        } else {
            return moduleRequire.async("montage-data/logic/service/data-service").then(function (module) {
                var DataService = module.DataService;
                that.mainService = new DataService();
                return that.mainService;
            });
        }
    },

    initServices: function () {
        var moduleRequire = this.moduleRequire,
            servicesModules = this.opts.services || [];
        return this.getMainService().then(function (mainService) {
            return Promise.all(servicesModules.map(function (serviceModule) {
                return moduleRequire.async(serviceModule.model).then(function (module) {
                    return moduleRequire.async(serviceModule.service).then(function (module) {
                        var service = new module[serviceModule.name]();
                        return mainService.addChildService(service);
                    });
                });
            }));
        });
    },

    getDataQuery: function (req) {
        var moduleRequire = this.moduleRequire; 
        return getRequestPayload(req).then(function (query) {
            return getDataQueryFromQuery(moduleRequire, query); 
        });
    },

    fetchData: function (req, res) {

        var moduleRequire = this.moduleRequire, 
            mainService = this.mainService;
       
        return this.getDataQuery(req).then(function (dataQuery) {
            return mainService.fetchData(dataQuery).then(function (result) {
                res.setHeader('content-type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.writeHead(200);
                res.end(JSON.stringify(result));
            });
        });
    }
};

module.exports = Accelerator;