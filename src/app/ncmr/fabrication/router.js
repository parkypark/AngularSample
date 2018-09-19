import _ from 'lodash';
import moment from 'moment';

import tplEdit from './edit.html';
import tplList from './list.html';
import tplPrint from './print.html';

export default function ncmrFabricationRouter($stateProvider) {
  'ngInject';

  const name = 'Fabrication';
  const route = 'fabrication';


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
        $sessionStorage: '$sessionStorage',
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
        $q: '$q',
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

function resolveNcmr($q, $stateParams, ApiService) {
  const deferred = $q.defer();
  ApiService.ncmr.fabrication.findOne($stateParams._id).then(response => {
    response.details = _.uniq(response.details, 'hash_code');
    response.report_date = moment(response.report_date).toDate();
    response.date_inspected = moment(response.date_inspected).toDate();
    deferred.resolve(response);
  });
  return deferred.promise;
}

function resolveNewNcmr($q, $sessionStorage, ApiService) {
  const deferred = $q.defer();
  ApiService.ncmr.fabrication.getNextReportNumber().then(response => {
    deferred.resolve({
      _id: null,
      report_number: response,
      report_date: new Date(),
      date_inspected: new Date(),
      comment: null,
      supplier: null,
      bundle_number: null,
      bundle_qty: null,
      report_filled_by: $sessionStorage.auth.user.full_name,
      attachments: [],
      details: []
    });
  });
  return deferred.promise;
}
