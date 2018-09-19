import _ from 'lodash';

import tplEdit from './edit.html';
import tplList from './list.html';
import tplPrint from './print.html';

export default function ncmrExternalRouter($stateProvider) {
  'ngInject';

  const name = 'External';
  const route = 'extrusions-external';

  $stateProvider
    .state(`ncmr.${route}`, {
      abstract: true,
      url: `/${route}`,
      template: '<div ui-view></div>'
    })
    .state(`ncmr.${route}.list`, {
      url: '/',
      title: `${name} NCMRs`,
      views: {
        'content@': {
          template: tplList,
          controller: `Ncmr${name}ListController`
        }
      }
    })
    .state(`ncmr.${route}.create`, {
      url: '/create',
      title: `Create ${name} NCMR`,
      resolve: {
        $q: '$q',
        ApiService: 'ApiService',
        ncmr: resolveNewNcmr
      },
      views: {
        'content@': {
          template: tplEdit,
          controller: `Ncmr${name}EditController`
        }
      }
    })
    .state(`ncmr.${route}.edit`, {
      url: '/edit/{_id}',
      title: `Edit ${name} NCMR`,
      resolve: {
        $stateParams: '$stateParams',
        ApiService: 'ApiService',
        ncmr: resolveNcmr
      },
      views: {
        'content@': {
          template: tplEdit,
          controller: `Ncmr${name}EditController`
        }
      }
    })
    .state(`ncmr.${route}.print`, {
      url: '/print/{_id}',
      title: `Print ${name} NCMR`,
      resolve: {
        $stateParams: '$stateParams',
        ApiService: 'ApiService',
        ncmr: resolveNcmr
      },
      views: {
        'content@': {
          template: tplPrint,
          controller: ['$scope', 'ncmr', ($scope, ncmr) => {
            $scope.ncmr = ncmr;

            let totalRejected = 0;
            for (let detail of ncmr.details) {
              totalRejected += detail.rejected;
            }
            $scope.totalRejected = totalRejected;
          }]
        }
      }
    });
}

function resolveNcmr($stateParams, ApiService) {
  return ApiService.ncmr.external.findOne($stateParams._id);
}

function resolveNewNcmr($q, ApiService) {
  const deferred = $q.defer();
  ApiService.ncmr.external.getNextReportNumber().then(response => {
    deferred.resolve({
      _id: null,
      report_number: response,
      report_date: new Date(),
      comment: null,
      attachments: [],
      details: []
    });
  });
  return deferred.promise;
}
