import _ from 'lodash';

export default function PqpService() {
  const service = {};

  service.importLookup = (data, lookUp, response) => {
    switch (lookUp) {
        case 'booth-tests':
          angular.forEach(Object.keys(data.booth_tests), function(key) {
            if (!_.find(response, { FrameSeries: key })) {
              delete data.booth_tests[key];
            }
          });

          angular.forEach(response, function(row) {
            if (data.booth_tests.hasOwnProperty(row.frame_series)) {
              data.booth_tests[row.frame_series].Tests = parseInt(row.tests, 10);
              data.booth_tests[row.frame_series].Failures = parseInt(row.failures, 10);
            } else {
              data.booth_tests[row.frame_series] = {
                FrameSeries: row.frame_series,
                Tests: parseInt(row.tests, 10),
                Failures: parseInt(row.failures, 10)
              };
            }
          });
          break;

        case 'field-water-frame-tests':
          angular.forEach(Object.keys(data.field_water_frame_tests), function(key) {
            if (!_.find(response, { FrameSeries: key })) {
              delete data.field_water_frame_tests[key];
            }
          });

          angular.forEach(response, function(row) {
            if (data.field_water_frame_tests.hasOwnProperty(row.frame_series)) {
              data.field_water_frame_tests[row.frame_series].Tests = parseInt(row.tests, 10);
              data.field_water_frame_tests[row.frame_series].FailuresMfg = parseInt(row.failures, 10);
            } else {
              data.field_water_frame_tests[row.frame_series] = {
                FrameSeries: row.frame_series,
                Tests: parseInt(row.tests, 10),
                FailuresMfg: parseInt(row.failures, 10)
              };
            }
          });
          break;

        case 'field-water-opening-tests':
          if (response) {
            data.field_water_opening_tests.Tests = parseInt(response.tests, 10);
            data.field_water_opening_tests.Failures = parseInt(response.failures, 10);
          } else {
            data.field_water_opening_tests.Tests = 0;
            data.field_water_opening_tests.Failures = 0;
          }

          break;

        case 'forward-load':
          data.forward_load = {};

          var grouped = {};
          angular.forEach(response, row => {
            let key;
            if (row.frame_series === 'CW' || row.frame_series === '9000SSG') {
              key = row.date_group + '|CurtainWall';
            } else if (row.frame_series === '4500') {
              key = row.date_group + '|PatioDoors';
            } else if (row.frame_series === '9500') {
              key = row.date_group + '|SwingDoors';
            } else {
              key = row.date_group + '|Windows';
            }

            if (!grouped.hasOwnProperty(key)) {
              grouped[key] = [];
            }
            grouped[key].push(row);
          });

          angular.forEach(grouped, function(group, key) {
            var dateGroup = key.split('|')[0];
            var category = key.split('|')[1];

            if (!data.forward_load.hasOwnProperty(dateGroup)) {
              data.forward_load[dateGroup] = {};
            }

            let totalRejected = 0;
            angular.forEach(group, item => {
              totalRejected += parseInt(item.total, 10);
            });
            data.forward_load[dateGroup][category] = totalRejected;
          });
          break;

        case 'production-quality':
          if (response) {
            data.production_quality.Inspections = parseInt(response.inspections, 10);
            data.production_quality.Failures = parseInt(response.failures, 10);
          } else {
            data.production_quality.Inspections = 0;
            data.production_quality.Failures = 0;
          }

          break;

        default:
          break;
    }
  };

  service.zip = (data) => {
    let ret = data || {};

    if (ret.aluminum_recycling) {
      if (ret.aluminum_recycling.SAPACostPerLb) {
        ret.aluminum_recycling.SAPACostPerLb = parseFloat(ret.aluminum_recycling.SAPACostPerLb);
      }
    } else {
      ret.aluminum_recycling = {};
    }

    if (ret.booth_tests) {
      ret.booth_tests = _.keyBy(ret.booth_tests, 'FrameSeries');
    } else {
      ret.booth_tests = {};
    }

    if (ret.employees) {
      ret.employees = _.keyBy(ret.employees, 'LocationId');
    } else {
      ret.employees = {};
    }

    if (ret.extrusion_quality) {
      ret.extrusion_quality = _.keyBy(ret.extrusion_quality, 'CategoryId');
    } else {
      ret.extrusion_quality = {};
    }

    if (ret.fabrication) {
      ret.fabrication = _.keyBy(ret.fabrication, 'TypeId');
    } else {
      ret.fabrication = {};
    }

    if (ret.field_water_frame_tests) {
      ret.field_water_frame_tests = _.keyBy(ret.field_water_frame_tests, 'FrameSeries');
    } else {
      ret.field_water_frame_tests = {};
    }

    if (!ret.field_water_opening_tests) {
      ret.field_water_opening_tests = {};
    }

    if (ret.forward_load) {
      ret.forward_load = _.keyBy(ret.forward_load, 'DateGroup');
    } else {
      ret.forward_load = {};
    }

    if (ret.inventory) {
      ret.inventory = _.keyBy(ret.inventory, function(row) {
        return [row.CategoryId, row.TypeId].join('-');
      });
    } else {
      ret.inventory = {};
    }

    if (ret.material_handling) {
      ret.material_handling = _.keyBy(ret.material_handling, 'CategoryId');
    } else {
      ret.material_handling = {};
    }

    if (!ret.production_quality) {
      ret.production_quality = {};
    }

    if (ret.productivity) {
      ret.productivity = _.keyBy(ret.productivity, 'DepartmentId');
    } else {
      ret.productivity = {};
    }

    if (ret.sealed_units) {
      ret.sealed_units = _.keyBy(ret.sealed_units, 'CategoryId');
    } else {
      ret.sealed_units = {};
    }

    return ret;
  };

  service.unzip = (data) => {
    let ret = angular.copy(data);

    if (ret.booth_tests && Object.keys(ret.booth_tests).length > 0) {
      ret.booth_tests = _.map(ret.booth_tests, function(row, key) {
        row.FrameSeries = parseInt(key, 10);
        return row;
      });
    } else {
      ret.boot_tests = null;
    }

    if (ret.employees && Object.keys(ret.employees).length > 0) {
      ret.employees = _.map(ret.employees, function(row, key) {
        row.LocationId = parseInt(key, 10);
        return row;
      });
    } else {
      ret.employees = null;
    }

    if (ret.extrusion_quality && Object.keys(ret.extrusion_quality).length > 0) {
      ret.extrusion_quality = _.map(ret.extrusion_quality, function(row, key) {
        row.CategoryId = parseInt(key, 10);
        return row;
      });
    } else {
      ret.extrusion_quality = null;
    }

    if (ret.fabrication && Object.keys(ret.fabrication).length > 0) {
      ret.fabrication = _.map(ret.fabrication, function(row, key) {
        row.TypeId = parseInt(key, 10);
        return row;
      });
    } else {
      ret.fabrication = null;
    }

    if (ret.field_water_frame_tests && Object.keys(ret.field_water_frame_tests).length > 0) {
      ret.field_water_frame_tests = _.map(ret.field_water_frame_tests, function(row, key) {
        row.FrameSeries = parseInt(key, 10);
        return row;
      });
    } else {
      ret.field_water_frame_tests = null;
    }

    if (ret.forward_load && Object.keys(ret.forward_load).length > 0) {
      ret.forward_load = _.map(ret.forward_load, function(row, key) {
        row.DateGroup = key;
        return row;
      });
    } else {
      ret.forward_load = null;
    }

    if (ret.inventory && Object.keys(ret.inventory).length > 0) {
      ret.inventory = _.map(ret.inventory, function(row, key) {
        var k = key.split('-');
        row.CategoryId = parseInt(k[0], 10);
        row.TypeId = parseInt(k[1], 10);
        return row;
      });
    } else {
      ret.inventory = null;
    }

    if (ret.material_handling && Object.keys(ret.material_handling).length > 0) {
      ret.material_handling = _.map(ret.material_handling, function(row, key) {
        row.CategoryId = parseInt(key, 10);
        return row;
      });
    } else {
      ret.material_handling = null;
    }

    if (ret.productivity && Object.keys(ret.productivity).length > 0) {
      ret.productivity = _.map(ret.productivity, function(row, key) {
        row.DepartmentId = parseInt(key, 10);
        return row;
      });
    } else {
      ret.productivity = null;
    }

    if (ret.sealed_units && Object.keys(ret.sealed_units).length > 0) {
      ret.sealed_units = _.map(ret.sealed_units, function(row, key) {
        row.CategoryId = parseInt(key, 10);
        return row;
      });
    } else {
      ret.sealed_units = null;
    }

    return ret;
  };

  return service;
}
