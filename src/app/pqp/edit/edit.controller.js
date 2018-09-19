import _ from 'lodash';
import moment from 'moment';

import mdlConfirmClear from '../../modals/confirm_clear.html';
import mdlConfirmDownload from '../../modals/confirm_download.html';
import mdlConfirmReset from '../../modals/confirm_reset.html';

export default function PqpEditController($scope, $rootScope, $state, $sessionStorage, $uibModal, ApiService, PqpService) {
  'ngInject';

  $scope.$storage = $sessionStorage;
  $scope.$state = $state;
  $scope.data = {};
  $scope.lastModified = 'N/A';

  $scope.nav = [
    { title: 'Aluminum Recycling', sref: 'pqp.edit.aluminum-recycling' },
    { title: 'Booth Tests', sref: 'pqp.edit.booth-tests' },
    { title: 'Employees', sref: 'pqp.edit.employees' },
    { title: 'Extrusion Quality', sref: 'pqp.edit.extrusion-quality' },
    { title: 'Fabrication Quality', sref: 'pqp.edit.fabrication-quality' },
    { title: 'Field Water Tests', sref: 'pqp.edit.field-water-tests' },
    { title: 'Forward Load', sref: 'pqp.edit.forward-load' },
    { title: 'Inventory', sref: 'pqp.edit.inventory' },
    { title: 'Material Handling Quality', sref: 'pqp.edit.material-handling-quality' },
    { title: 'Production Quality', sref: 'pqp.edit.production-quality' },
    { title: 'Productivity', sref: 'pqp.edit.productivity' },
    { title: 'Sealed Units', sref: 'pqp.edit.sealed-units' }
  ];

  const init = function() {
    let year = moment(new Date()).year();
    let month = moment(new Date()).month() + 1;

    if (!$sessionStorage.pqp) {
      $sessionStorage.pqp = { reportDate: { year, month } };
    }

    let reportDate = $sessionStorage.pqp.reportDate;
    if (!reportDate.year || reportDate.year < 2007 || reportDate.year > year) {
      reportDate.year = year;
    }
    if (!reportDate.month || reportDate.month < 1 || reportDate.month > 12) {
      reportDate.month = month;
    }

    $scope.yearRange = _.range(2007, moment(new Date()).year() + 1);
    $scope.monthRange = _.map(moment.months(), (month, index) => {
      return { id: index + 1, description: month };
    });

    $scope.$watch('$storage.pqp.reportDate', reportDate => {
      const rd = moment(new Date(reportDate.year, reportDate.month - 1, 1, 0, 0, 0)).format('YYYY-MM-DD');
      $rootScope.loading = true;

      ApiService.pqp.getReport(rd).then(response => {
        $scope.data = PqpService.zip(response);

        if (!$scope.data.Date) {
          $scope.data.Date = rd;
        }

        if ($scope.data.updated_at) {
          const d = moment($scope.data.updated_at, 'YYYY-MM-DD HH:mm:SS');
          $scope.lastModified = d.format('lll');
        } else {
          $scope.lastModified = 'N/A';
        }

        $scope.backup = angular.copy($scope.data);
        $rootScope.loading = false;
      });
    }, true);
  };
  init();

  $scope.lookUpData = () => {
    const modalCtrl = ($scope, $uibModalInstance) => {
      'ngInject';
      $scope.yes = $uibModalInstance.close;
      $scope.no = $uibModalInstance.dismiss;
    };

    $uibModal
      .open({
        template: mdlConfirmDownload,
        controller: modalCtrl
      })
      .result.then(() => {
        const lookUp = $scope.$state.current.data.lookUp;
        const reportDate = $scope.$storage.pqp.reportDate;
        const config = {};

        if (lookUp === 'forward-load') {
          config.params = {
            date: moment(new Date(reportDate.year, reportDate.month, 1, 0, 0, 0)).format('YYYY-MM-DD')
          };
        } else {
          config.params = reportDate;
        }

        $rootScope.loading = true;
        if (angular.isArray(lookUp)) {
          angular.forEach(lookUp, (lookUp) => {
            ApiService.pqp.lookUp(lookUp, config).then(response => {
              PqpService.importLookup($scope.data, lookUp, response);
              $rootScope.loading = false;
            });
          });
        } else {
          ApiService.pqp.lookUp(lookUp, config).then(response => {
            PqpService.importLookup($scope.data, lookUp, response);
            $rootScope.loading = false;
          });
        }
      });
  };

  $scope.clear = () => {
    $uibModal
      .open({
        template: mdlConfirmClear,
        controller: ($scope, $uibModalInstance) => {
          'ngInject';
          $scope.yes = $uibModalInstance.close;
          $scope.no = $uibModalInstance.dismiss;
        }
      })
      .result.then(() => {
        if (angular.isArray($scope.$state.current.data.key)) {
          angular.forEach($scope.$state.current.data.key, key => {
            $scope.data[key] = {};
          });
        } else {
          $scope.data[$scope.$state.current.data.key] = {};
        }
      });
  };

  $scope.reset = () => {
    $uibModal
      .open({
        template: mdlConfirmReset,
        controller: ($scope, $uibModalInstance) => {
          'ngInject';
          $scope.yes = $uibModalInstance.close;
          $scope.no = $uibModalInstance.dismiss;
        }
      })
      .result.then(() => {
        if (angular.isArray($scope.$state.current.data.key)) {
          angular.forEach($scope.$state.current.data.key, key => {
            angular.copy($scope.backup[key], $scope.data[key]);
          });
        } else {
          angular.copy($scope.backup[$scope.$state.current.data.key], $scope.data[$scope.$state.current.data.key]);
        }
      });
  };

  $scope.save = () => {
    if (!$scope.data) {
      return; // Shouldn't happen
    }

    $rootScope.loading = true;
    ApiService.pqp.save(PqpService.unzip($scope.data)).then(response => {
      if (response.status === 200) {
        $scope.data = PqpService.zip(response.data);
        $scope.backup = angular.copy($scope.data);
      }
      $rootScope.loading = false;
    });
  };

  $scope.formUnchanged = () => {
    if (!($scope.data && $scope.backup && $scope.$state.current.data)) {
      return true;
    }

    if (angular.isArray($scope.$state.current.data.key)) {
      return _.every($scope.$state.current.data.key, key => {
        return angular.equals($scope.data[key], $scope.backup[key]);
      });
    }

    return angular.equals($scope.data[$scope.$state.current.data.key], $scope.backup[$scope.$state.current.data.key]);
  };

  $scope.formInvalid = () => {
    return angular.equals($scope.data, $scope.backup);
  };
}
