// Montage Accelerator env
var URL = require('url');
global.XMLHttpRequest = require('xhr2');

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

// create an instance of DataSelector using basic serialiation
function getDataQueryFromParams(mr, query) {
    return mr.async("montage-data/logic/service/data-selector").then(function (module) {
        var DataSelector = module.DataSelector;
        return mr.async("montage/core/criteria").then(function (module) {
            var Criteria = module.Criteria;
            return mr.async(query.module).then(function (module) {
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


function Accelerator(moduleRequire, opts) {
    this.moduleRequire = moduleRequire;
    this.opts = opts;
}

Accelerator.prototype = {

    moduleRequire: null,

    mainService: null,

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
        var promise,
            moduleRequire = this.moduleRequire,
            url = URL.parse(req.url),
            params = getQueryFromUrl(url.query); 

        if (params.query) {
            promise = getDataQueryFromQuery(moduleRequire, params.query);
        } else {
            promise = getDataQueryFromParams(moduleRequire, params);
        }

        return promise;
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