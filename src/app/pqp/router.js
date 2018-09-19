import _ from 'lodash';
import moment from 'moment';

import tplHeader from '../header.html';
import tplEditIndex from './edit/index.html';
import tplEditAluminumRecycling from './edit/aluminum_recycling.html';
import tplEditBoothTests from './edit/booth_tests.html';
import tplEditEmployees from './edit/employees.html';
import tplEditExtrusionQuality from './edit/extrusion_quality.html';
import tplEditFabricationQuality from './edit/fabrication_quality.html';
import tplEditFieldWaterTests from './edit/field_water_tests.html';
import tplEditForwardLoad from './edit/forward_load.html';
import tplEditInventory from './edit/inventory.html';
import tplEditMaterialHandlingQuality from './edit/material_handling_quality.html';
import tplEditProductionQuality from './edit/production_quality.html';
import tplEditProductivity from './edit/productivity.html';
import tplEditSealedUnits from './edit/sealed_units.html';

export default function pqpRouter($stateProvider) {
  'ngInject';

  $stateProvider
    .state('pqp', {
      url: '/pqp',
      abstract: true,
      views: {
        header: {
          template: tplHeader
        }
      }
    })
    .state('pqp.edit', {
      url: '/edit',
      abstract: true,
      views: {
        'content@': {
          template: tplEditIndex,
          controller: 'PqpEditController'
        }
      }
    })
    .state('pqp.edit.aluminum-recycling', {
      url: '/aluminum-recycling',
      title: 'Aluminum Recycling',
      data: { key: 'aluminum_recycling' },
      template: tplEditAluminumRecycling
    })
    .state('pqp.edit.booth-tests', {
      url: '/booth-tests',
      title: 'Booth Tests',
      template: tplEditBoothTests,
      data: { key: 'booth_tests', lookUp: 'booth-tests' },
      controller: ($scope, categories) => {
        'ngInject';
        $scope.categories = categories;
      },
      resolve: {
        categories: ($q, ApiService) => {
          'ngInject';
          const deferred = $q.defer();
          ApiService.pqp.getFrameSeries().then(response => {
            deferred.resolve(response);
          });
          return deferred.promise;
        }
      }
    })
    .state('pqp.edit.employees', {
      url: '/employees',
      title: 'Employees',
      template: tplEditEmployees,
      data: { key: 'employees' },
      controller: ($scope, categories) => {
        'ngInject';
        $scope.categories = categories;
      },
      resolve: {
        categories: ($q, ApiService) => {
          'ngInject';
          const deferred = $q.defer();
          ApiService.pqp.getEmployeeLocations().then(response => {
            deferred.resolve(response);
          });
          return deferred.promise;
        }
      }
    })
    .state('pqp.edit.extrusion-quality', {
      url: '/extrusion-quality',
      title: 'Extrusion Quality',
      template: tplEditExtrusionQuality,
      data: { key: 'extrusion_quality' },
      controller: ($scope, categories) => {
        'ngInject';
        $scope.categories = categories;
      },
      resolve: {
        categories: ($q, ApiService) => {
          'ngInject';
          const deferred = $q.defer();
          ApiService.pqp.getExtrusionQualityCategories().then(response => {
            deferred.resolve(response);
          });
          return deferred.promise;
        }
      }
    })
    .state('pqp.edit.fabrication-quality', {
      url: '/fabrication-quality',
      title: 'Fabrication Quality',
      template: tplEditFabricationQuality,
      data: { key: 'fabrication' },
      controller: ($scope, categories) => {
        'ngInject';
        $scope.categories = categories;
      },
      resolve: {
        categories: ($q, ApiService) => {
          'ngInject';
          const deferred = $q.defer();
          ApiService.pqp.getFabricationTypes().then(response => {
            deferred.resolve(response);
          });
          return deferred.promise;
        }
      }
    })
    .state('pqp.edit.field-water-tests', {
      url: '/field-water-tests',
      title: 'Field Water Tests',
      template: tplEditFieldWaterTests,
      data: {
        key: ['field_water_frame_tests', 'field_water_opening_tests'],
        lookUp: ['field-water-frame-tests', 'field-water-opening-tests']
      },
      controller: ($scope, categories) => {
        'ngInject';
        $scope.categories = categories;
      },
      resolve: {
        categories: ($q, ApiService) => {
          'ngInject';
          const deferred = $q.defer();
          ApiService.pqp.getFrameSeries().then(response => {
            deferred.resolve(response);
          });
          return deferred.promise;
        }
      }
    })
    .state('pqp.edit.forward-load', {
      url: '/forward-load',
      template: tplEditForwardLoad,
      title: 'Forward Load',
      data: { key: 'forward_load', lookUp: 'forward-load' },
      controller: ($scope, $sessionStorage) => {
        'ngInject';

        const deregister = $scope.$watch(() => {
          return $sessionStorage.pqp.reportDate;
        }, () => {
          $scope.categories = [];

          let start = moment(new Date($sessionStorage.pqp.reportDate.year, $sessionStorage.pqp.reportDate.month - 1, 1, 0, 0, 0));
          for (let i = 1; i <= 6; ++i) {
            start = start.add(1, 'months');
            $scope.categories.push({
              id: start.format('YYYY-MM-DD'),
              description: start.format('MMM YYYY')
            });
          }
        }, true);

        $scope.$on('$destroy', () => {
          deregister();
        });
      }
    })
    .state('pqp.edit.inventory', {
      url: '/inventory',
      title: 'Inventory',
      template: tplEditInventory,
      data: { key: 'inventory' },
      controller: ($scope, categories, types) => {
        'ngInject';
        $scope.categories = categories;
        $scope.types = types;
      },
      resolve: {
        categories: ($q, ApiService) => {
          'ngInject';
          const deferred = $q.defer();
          ApiService.pqp.getInventoryCategories().then(response => {
            deferred.resolve(response);
          });
          return deferred.promise;
        },
        types: ($q, ApiService) => {
          'ngInject';
          const deferred = $q.defer();
          ApiService.pqp.getInventoryTypes().then(response => {
            deferred.resolve(_.groupBy(response, 'CategoryId'));
          });
          return deferred.promise;
        }
      }
    })
    .state('pqp.edit.material-handling-quality', {
      url: '/material-handling-quality',
      title: 'Material Handling Quality',
      template: tplEditMaterialHandlingQuality,
      data: { key: 'material_handling' },
      controller: ($scope, categories) => {
        'ngInject';
        $scope.categories = categories;
      },
      resolve: {
        categories: ($q, ApiService) => {
          'ngInject';
          const deferred = $q.defer();
          ApiService.pqp.getMaterialHandlingCategories().then(response => {
            deferred.resolve(response);
          });
          return deferred.promise;
        }
      }
    })
    .state('pqp.edit.production-quality', {
      url: '/production-quality',
      title: 'Production Quality',
      data: { key: 'production_quality', lookUp: 'production-quality' },
      template: tplEditProductionQuality
    })
    .state('pqp.edit.productivity', {
      url: '/productivity',
      data: { key:'productivity' },
      template: tplEditProductivity,
      title: 'Productivity',
      controller: ($scope, categories) => {
        'ngInject';
        $scope.departments = categories;
      },
      resolve: {
        categories: ($q, ApiService) => {
          'ngInject';
          const deferred = $q.defer();
          ApiService.pqp.getProductivityDepartments().then(response => {
            deferred.resolve(response);
          });
          return deferred.promise;
        }
      }
    })
    .state('pqp.edit.sealed-units', {
      url: '/sealed-units',
      data: { key:'sealed_units' },
      template: tplEditSealedUnits,
      title: 'Sealed Units',
      controller: ($scope, categories) => {
        'ngInject';
        $scope.categories = categories;
      },
      resolve: {
        categories: ($q, ApiService) => {
          'ngInject';
          const deferred = $q.defer();
          ApiService.pqp.getSealedUnitCategories().then(response => {
            deferred.resolve(response);
          });
          return deferred.promise;
        }
      }
    });
}
