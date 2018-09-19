import _ from 'lodash';

import mdlAddLine from './modal.add_line.html';
import mdlConfirmDelete from '../../modals/confirm_delete.html';

export default function NcmrExternalEditCtrl($scope, $q, $state, $stateParams, $timeout, $uibModal, toastr, ApiService, HashService, ncmr, hotkeys) {
  'ngInject';

  const initSelectedLines = () => {
    $scope.selectedLines = {};
    angular.forEach(ncmr.details, (row) => {
      $scope.selectedLines[row.hash_code] = false;
    });
  };
  initSelectedLines();

  // scope vars
  angular.extend($scope, {
    ncmr,
    backup: angular.copy(ncmr)
  });

  // methods
  angular.extend($scope, {
    addAttachments: (files) => {
      const readFile = (file) => {
        const deferred = $q.defer();
        const reader = new FileReader();

        reader.onload = (e) => {
          deferred.resolve(e.target.result);
        };
        reader.onerror = (err) => {
          deferred.reject(err);
        };
        reader.readAsDataURL(file);

        return deferred.promise;
      };

      const regex = /(?:\.([^.]+))?$/;

      angular.forEach(files, (file) => {
        let ext = regex.exec(file.name)[1].toLowerCase();
        if (ext.length === 0) {
          ext = 'jpg';
        }

        readFile(file).then((data) => {
          const fileName = 'attachment' + ('000' + ($scope.ncmr.attachments.length + 1)).slice(-3) + '.' + ext;
          $scope.ncmr.attachments.push({ name: fileName, data });
        });
      });

    },

    addLines: () => {
      $uibModal.open({
        backdrop: 'static',
        size: 'lg',
        template: mdlAddLine,
        controller: ($scope, $uibModalInstance, materials) => {
          'ngInject';

          $scope.data = {};
          $scope.materials = materials;
          $scope.$uibModalInstance = $uibModalInstance;

          $scope.$watch('profile', (profile) => {
            if (angular.isDefined(profile)) {
              $scope.data.die_number = profile.die_number;
            }
          });

          $scope.isValid = () => {
            let d = $scope.data;
            return d.die_number && d.stock_length && d.colour && d.po_number && d.discrepancy &&
              d.picked && d.rejected;
          };
        },
        resolve: {
          materials:  ApiService.ncmr.external.getMaterials()
        }
      }).result.then((data) => {
        data.hash_code = HashService.hash([
          data.die_number,
          data.stock_length,
          data.colour,
          data.po_number,
          data.rcv_number,
          data.discrepancy
        ].join('.'));

        // Add if not exists
        if (_.findIndex($scope.ncmr.details, { hash_code: data.hash_code }) === -1) {
          $scope.ncmr.details.push(angular.copy(data));
        }

        // Recalculate sort time
        let totalRejected = 0;
        for (let detail of ncmr.details) {
          totalRejected += detail.rejected;
        }
        $scope.ncmr.sort_time = Math.max(1, Math.round(totalRejected / 30 * 100) / 100);
      });
    },

    deleteSelectedLines: () => {
      $uibModal.open({
        backdrop: 'static',
        template: mdlConfirmDelete,
        controller: ($scope, $uibModalInstance) => {
          'ngInject';

          $scope.$modalInstance = $uibModalInstance;
          $scope.title = 'Delete Lines';
          $scope.what = 'the selected lines';
        }
      }).result.then(() => {
        $scope.ncmr.details = $scope.ncmr.details.filter((value) => {
          return !$scope.selectedLines[value.hash_code];
        });
        initSelectedLines();
      });
    },

    hasSelectedLines: () => {
      return _.some($scope.selectedLines, (value) => {
        return value;
      });
    },

    isValid: () => {
      if (angular.equals($scope.ncmr, $scope.backup)) {
        return false;
      }

      return $scope.ncmr.report_number && $scope.ncmr.report_date && $scope.ncmr.inspector &&
        $scope.ncmr.supplier && $scope.ncmr.destination;
    },

    save: () => {
      ApiService.ncmr.external.save($scope.ncmr)
        .then((response) => {
          if (response.errors) {
            toastr.error('Failed to save NCMR', 'Error');
            return;
          }
          toastr.success('NCMR Saved', 'Success');
          $state.go('^.list');
        }, () => {
          toastr.error('Failed to save NCMR', 'Error');
        });
    }
  });

  // hot keys
  hotkeys.bindTo($scope)
    .add({
      combo: 'ctrl+a',
      callback: (event) => {
        $scope.addLines();
        event.preventDefault();
      }
    })
    .add({
      combo: 'ctrl+s',
      callback: (event) => {
        if ($scope.isValid()) {
          $scope.save();
        }
        event.preventDefault();
      }
    });
}
