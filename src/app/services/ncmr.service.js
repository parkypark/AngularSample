import _ from 'lodash';

export default function NcmrService($q, $rootScope, $timeout, $state, ApiService) {
  'ngInject';

  const updateInterval = 30 * 1000;
  const service = {};

  const performUpdate = tableState => {
    switch ($state.current.name) {
        case 'ncmr.extrusions-external.list':
          service.external.getNcmrs(tableState);
          break;
        case 'ncmr.extrusions-internal.list':
          service.internal.getNcmrs(tableState);
          break;
        case 'ncmr.fabrication.list':
          service.fabrication.getNcmrs(tableState);
          break;
        default:
          break;
    }
  };

  service.external = {
    displayed: [],
    hash: false,
    numRecords: 0,
    refresh: () => {},
    start: 0,
    updateTimer: null,

    getNcmrs: tableState => {
      service.external.refresh = state => {
        angular.extend(tableState, state);
        service.external.getNcmrs(tableState);
      };

      const number = tableState.pagination.number || 10;

      $timeout.cancel(service.external.updateTimer);
      $rootScope.loading = tableState.pagination.start !== service.external.start;
      service.external.start = tableState.pagination.start;

      ApiService.ncmr.external.all({ tableState, hash: service.external.hash }).then(response => {
        if (response) {
          service.external.displayed = response.data || [];
          service.external.numRecords = response.total || 0;
          service.external.hash = response.hash || false;
        }

        tableState.pagination.numberOfPages = Math.ceil(service.external.numRecords / number);
        $rootScope.loading = false;
        service.external.updateTimer = $timeout(() => performUpdate(tableState), updateInterval);
      }, () => {
        service.external.displayed = [];
        service.external.hash = false;
        tableState.pagination.numberOfPages = 0;
        $rootScope.loading = false;
        service.external.updateTimer = $timeout(() => performUpdate(tableState), updateInterval);
      });
    },

    init: () => {
      const deferred = $q.defer();
      ApiService.ncmr.external.all().then(response => {
        if (response) {
          service.external.displayed = response.data || [];
          service.external.numRecords = response.total || 0;
          service.external.hash = response.hash || false;
        }
        deferred.resolve();
      });
      return deferred.promise;
    }
  };

  service.fabrication = {
    displayed: [],
    hash: false,
    numRecords: 0,
    refresh: () => {},
    start: 0,
    updateTimer: null,

    getNcmrs: tableState => {
      service.fabrication.refresh = state => {
        angular.extend(tableState, state);
        service.fabrication.getNcmrs(tableState);
      };

      const number = tableState.pagination.number || 10;

      $timeout.cancel(service.fabrication.updateTimer);
      $rootScope.loading = tableState.pagination.start !== service.fabrication.start;
      service.fabrication.start = tableState.pagination.start;

      ApiService.ncmr.fabrication.all({ tableState, hash: service.fabrication.hash }).then(response => {
        if (response) {
          angular.forEach(response.data, ncmr => {
            ncmr.details = _.uniq(ncmr.details, 'hash_code');
          });

          service.fabrication.displayed = response.data;
          service.fabrication.numRecords = response.total;
          service.fabrication.hash = response.hash;
        }

        $rootScope.loading = false;
        tableState.pagination.numberOfPages = Math.ceil(service.fabrication.numRecords / number);
        service.fabrication.updateTimer = $timeout(() => performUpdate(tableState), updateInterval);
      }, () => {
        service.fabrication.displayed = [];
        service.fabrication.hash = false;
        tableState.pagination.numberOfPages = 0;
        $rootScope.loading = false;
        service.fabrication.updateTimer = $timeout(() => performUpdate(tableState), updateInterval);
      });
    },

    init: () => {
      const deferred = $q.defer();
      ApiService.ncmr.fabrication.all().then(response => {
        if (response) {
          angular.forEach(response.data, ncmr => {
            ncmr.details = _.uniq(ncmr.details, 'hash_code');
          });

          service.fabrication.displayed = response.data;
          service.fabrication.numRecords = response.total;
          service.fabrication.hash = response.hash;
        }
        deferred.resolve();
      });
      return deferred.promise;
    }
  };

  service.internal = {
    displayed: [],
    numRecords: 0,
    updateTimer: null,
    start: 0,
    hash: false,
    refresh: () => {},

    getNcmrs: tableState => {
      service.internal.refresh = state => {
        angular.extend(tableState, state);
        service.internal.getNcmrs(tableState);
      };

      const number = tableState.pagination.number || 10;

      $timeout.cancel(service.internal.updateTimer);
      $rootScope.loading = tableState.pagination.start !== service.internal.start;
      service.internal.start = tableState.pagination.start;

      ApiService.ncmr.internal.all({ tableState, hash: service.internal.hash }).then(response => {
        if (response) {
          service.internal.displayed = response.data;
          service.internal.numRecords = response.total;
          service.internal.hash = response.hash;
        }

        $rootScope.loading = false;
        tableState.pagination.numberOfPages = Math.ceil(service.internal.numRecords / number);
        service.internal.updateTimer = $timeout(() => performUpdate(tableState), updateInterval);
      }, () => {
        $rootScope.loading = false;
        service.internal.displayed = [];
        service.internal.hash = false;
        tableState.pagination.numberOfPages = 0;
        service.internal.updateTimer = $timeout(() => performUpdate(tableState), updateInterval);
      });
    },

    init: () => {
      const deferred = $q.defer();
      ApiService.ncmr.internal.all({ tableState: {} }).then(response => {
        if (response) {
          service.internal.displayed = response.data;
          service.internal.numRecords = response.total;
          service.internal.hash = response.hash;
        }
        deferred.resolve(service.internal);
      });
      return deferred.promise;
    }
  };

  return service;
}
