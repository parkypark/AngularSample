import _ from 'lodash';
import moment from 'moment';

import mdlListNumberChooser from '../../modals/list_number_chooser.html';
import mdlMaterialQuantityForm from '../../modals/material_quantity_form.html';
import mdlFailureDetailsForm from '../../modals/failure_details_form.html';
import mdlConfirmDelete from '../../modals/confirm_delete.html';
import mdlAddLineManual from './modal.add_line_manual.html';

export default function NcmrInternalEditCtrl($scope, $q, $state, $stateParams, $timeout, $uibModal, toastr, ApiService, HashService, ncmr, hotkeys) {
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
    addAttachments: files => {
      const readFile = file => {
        const deferred = $q.defer();
        const reader = new FileReader();

        reader.onload = function(e) {
          deferred.resolve(e.target.result);
        };
        reader.onerror = function(err) {
          deferred.reject(err);
        };
        reader.readAsDataURL(file);

        return deferred.promise;
      };

      const regex = /(?:\.([^.]+))?$/;

      angular.forEach(files, file => {
        let ext = regex.exec(file.name)[1].toLowerCase();
        if (ext.length === 0) {
          ext = 'jpg';
        }

        readFile(file).then(data => {
          const name = 'attachment' + ('000' + ($scope.ncmr.attachments.length + 1)).slice(-3) + '.' + ext;
          $scope.ncmr.attachments.push({ name, data });
        });
      });

    },

    addLines: () => {
      const step1 = () => {
        return $uibModal.open({
          backdrop: 'static',
          template: mdlListNumberChooser,
          controller: ($scope, $uibModalInstance, ApiService) => {
            'ngInject';
            $scope.lists = {};
            $scope.listPage = 1;
            $scope.listLength = 10;
            $scope.$uibModalInstance = $uibModalInstance;

            $scope.getData = predicate => {
              ApiService.ncmr.internal.getMaterialsRequired($scope.listLength * ($scope.listPage - 1), $scope.listLength, predicate).then(response => {
                $scope.lists = response;
              });
            };

            $scope.getLists = tableState => {
              let predicate = null;
              if (tableState && tableState.search && tableState.search.predicateObject && tableState.search.predicateObject.header) {
                predicate = tableState.search.predicateObject.header;
              }
              $scope.listPage = 1;
              $scope.getData(predicate);
            };

            $scope.prevPage = () => {
              $scope.listPage--;
              $scope.getData();
            };

            $scope.nextPage = () => {
              $scope.listPage++;
              $scope.getData();
            };
          }
        }).result;
      };

      const step2 = (list) => {
        return $uibModal.open({
          backdrop: 'static',
          template: mdlMaterialQuantityForm,
          controller: ($scope, $uibModalInstance, materials) => {
            'ngInject';

            $scope.$uibModalInstance = $uibModalInstance;
            $scope.materials = angular.copy(materials);

            $scope.rejected = {};
            angular.forEach(materials, material => {
              $scope.rejected[material.hash_code] = 0;
            });

            $scope.submit = () => {
              let ret = [];
              angular.forEach(materials, material => {
                if ($scope.rejected[material.hash_code] > 0) {
                  material.rejected = $scope.rejected[material.hash_code];
                  ret.push(angular.copy(material));
                }
              });
              $uibModalInstance.close(ret);
            };
          },
          resolve: {
            materials: () => {
              const alreadyRejected = _.map(ncmr.details, 'hash_code');
              let ret = {};

              angular.forEach(list.materials, profile => {
                angular.forEach(profile.extrusions, extrusion => {
                  // Check for profile already exists and bail out if it does
                  if (_.includes(alreadyRejected, extrusion.hash_code)) {
                    return;
                  }

                  if (!ret[extrusion.hash_code]) {
                    ret[extrusion.hash_code] = {
                      hash_code: extrusion.hash_code,
                      profile: extrusion.profile,
                      color: extrusion.color,
                      stock_length: profile.stock_length,
                      frame_types: profile.frame_types,
                      max_quantity: 0,
                      rejected: 0
                    };
                  }
                  ret[extrusion.hash_code].max_quantity += profile.quantity;
                });
              });

              return _.map(ret, item => {
                return item;
              });
            }
          }
        }).result;
      };

      const step3 = materials => {
        return $uibModal.open({
          backdrop: 'static',
          template: mdlFailureDetailsForm,
          controller: ($scope, $uibModalInstance, productTypes) => {
            'ngInject';

            $scope.data = {};
            $scope.productTypes = productTypes;
            $scope.$uibModalInstance = $uibModalInstance;
          },
          resolve: {
            productTypes: () => {
              let productTypes = [];
              angular.forEach(materials, profile => {
                productTypes = productTypes.concat(profile.frame_types);
              });
              return _.uniq(productTypes).sort();
            }
          }
        }).result;
      };

      step1().then(list => {
        step2(list).then(materials => {
          step3(materials).then(result => {
            materials.forEach(profile => {
              delete profile.frame_types; // no longer required

              profile.list_number = list.header.list_number;
              profile.project_name = list.header.project_name;
              profile.project_number = list.header.project_number;

              angular.extend(result, profile);
              $scope.ncmr.details.push(angular.copy(result));
            });
          });
        });
      });
    },

    addLinesManual: () => {
      $uibModal.open({
        backdrop: 'static',
        size: 'lg',
        template: mdlAddLineManual,
        controller: ($scope, $uibModalInstance) => {
          'ngInject';
          $scope.$uibModalInstance = $uibModalInstance;

          $scope.isValid = () => {
            if (!$scope.data) {
              return false;
            }

            let toCheck = [
              'color',
              'discrepancy',
              'failure_source',
              'found_by_department',
              'profile',
              'project_name',
              'project_number',
              'rush_code'
            ];

            for (let i = 0; i < toCheck.length; ++i) {
              if (!($scope.data[toCheck[i]] && $scope.data[toCheck[i]].length > 0)) {
                return false;
              }
            }

            toCheck = [
              'list_number',
              'rejected',
              'stock_length'
            ];

            for (let i = 0; i < toCheck.length; ++i) {
              if (!($scope.data[toCheck[i]] && $scope.data[toCheck[i]] > 0)) {
                return false;
              }
            }

            return true;
          };
        }
      }).result.then(line => {
        line.hash_code = HashService.hash([line.list_number, line.profile, line.stock_length, line.color].join('.'));
        $scope.ncmr.details.push(line);
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
        $scope.ncmr.details = $scope.ncmr.details.filter(value => {
          return !$scope.selectedLines[value.hash_code];
        });
        initSelectedLines();
      });
    },

    hasSelectedLines: () => {
      return _.some($scope.selectedLines, value => {
        return value;
      });
    },

    isValid: () => {
      if (angular.equals($scope.ncmr, $scope.backup)) {
        return false;
      }
      return $scope.ncmr.report_number && $scope.ncmr.report_date && $scope.ncmr.inspector;
    },

    save: () => {
      ApiService.ncmr.internal.save($scope.ncmr)
        .then(response => {
          if (response.errors) {
            toastr.error('Failed to save NCMR', 'Error');
          } else {
            $state.go('^.list');
          }
        }, () => {
          toastr.error('Failed to save NCMR', 'Error');
        });
    }
  });

  // date picker
  angular.extend($scope, {
    maxDate: moment(),
    minDate: moment().subtract(1, 'years'),

    disabled: (date, mode) => {
      return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6));
    },

    open: $event => {
      $event.stopPropagation();
      $scope.opened = true;
    }
  });

  // hot keys
  hotkeys.bindTo($scope)
    .add({
      combo: 'ctrl+a',
      callback: event => {
        $scope.addLines();
        event.preventDefault();
      }
    })
    .add({
      combo: 'ctrl+s',
      callback: event => {
        if ($scope.isValid()) {
          $scope.save();
        }
        event.preventDefault();
      }
    });
}
