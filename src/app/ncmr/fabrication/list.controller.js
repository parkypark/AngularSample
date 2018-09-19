import _ from 'lodash';

import mdlConfirmDelete from '../../modals/confirm_delete.html';

export default function NcmrFabricationListController($scope, $state, $timeout, $uibModal, ApiService, NcmrService) {
  'ngInject';

  // scope vars
  angular.extend($scope, {
    table: NcmrService.fabrication,
    expandedRows: {}
  });

  // methods
  angular.extend($scope, {
    edit: row => {
      $state.go('ncmr.fabrication.edit', { _id: row._id });
    },

    expandRow: (event, row) => {
      if (!event.isDropDownEvent) {
        $scope.expandedRows[row._id] = !$scope.expandedRows[row._id];
      }
    },

    getTotalRejected: _.memoize(ncmr => {
      let totalRejected = 0;
      for (const detail of ncmr.details) {
        totalRejected += detail.rejected;
      }
      return totalRejected;
    }, ncmr => {
      return ncmr._id;
    }),

    remove: row => {
      $uibModal.open({
        backdrop: 'static',
        template: mdlConfirmDelete,
        controller: ($scope, $uibModalInstance) => {
          'ngInject';
          $scope.$modalInstance = $uibModalInstance;
          $scope.title = 'Delete NCMR';
          $scope.what = 'fabrication NCMR #' + row.report_number;
        }
      }).result.then(() => {
        ApiService.ncmr.fabrication.remove(row).then(() => {
          NcmrService.fabrication.refresh();
        });
      });
    }
  });

  // watchers
  const deregister = $scope.$watch('table.displayed', value => {
    angular.forEach(value, ncmr => {
      if (angular.isUndefined($scope.expandedRows[ncmr._id])) {
        $scope.expandedRows[ncmr._id] = false;
      }
      ncmr.selectedLines = _.filter(ncmr.details, { selected: true });
    });
  }, true);

  $scope.$on('$destroy', () => {
    deregister();
  });
}
