import _ from 'lodash';

import mdlConfirmDelete from '../../modals/confirm_delete.html';

export default function NcmrInternalListCtrl($scope, $timeout, $uibModal, ApiService, NcmrService) {
  'ngInject';

  // scope vars
  angular.extend($scope, {
    table: NcmrService.internal,
    expandedRows: {}
  });

  // methods
  angular.extend($scope, {
    expandRow: (event, row) => {
      if (!event.isDropDownEvent) {
        $scope.expandedRows[row._id] = !$scope.expandedRows[row._id];
      }
    },

    getTotalRejected: _.memoize(ncmr => {
      let sum = 0;
      for (let detail of ncmr.details) {
        sum += detail.rejected;
      }
      return sum;
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
          $scope.what = 'internal NCMR #' + row.report_number;
        }
      }).result.then(() => {
        ApiService.ncmr.internal.remove(row).then(() => {
          $scope.table.refresh();
        });
      });
    }
  });

  // watchers
  const deregister = $scope.$watch('table.displayed', function(value) {
    angular.forEach(value, function(ncmr) {
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
