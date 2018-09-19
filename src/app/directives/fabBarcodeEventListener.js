export default function FabBarcodeListenerEventDir() {
  return {
    restrict: 'EA',
    scope:{
      output: '='
    },
    link: ($scope) => {
      const isFocused = () => {
        return (angular.element('.form-control').is(':focus'));
      };
      angular.element('.form-control').focus(() => {
        $scope.manualEntry = true;
      });
      angular.element('.form-control').blur(() => {
        if (!isFocused()) {
          $scope.manualEntry = false;
        }
      });
    },
    controller: ($scope, $window, $timeout, $http, $uibModal, ApiService, HashService) => {
      'ngInject';
      const prefixStart = 'X';
      const prefixEnd = 'V';
      const prefixmiddle = 'P';
      const refreshTime = '500';
      let processing = false;
      let findV = false;
      let digitsAfterV = 5;
      $scope.isProcessing = false;
      $scope.scanTimeout = null;
      let values = '';

      const codeValidation = (code) => {
        if (code.indexOf(prefixmiddle) === -1) {
          return false;
        }

        let codeArr = code.split('');
        if (codeArr[0].toLowerCase() !== prefixStart.toLowerCase() &&
           codeArr[codeArr.length - 1].toLowerCase() !== prefixEnd.toLowerCase() &&
           codeArr[12].toLowerCase() !== prefixmiddle.toLowerCase()) {
          return false;
        }

        return true;
      };
      const startup = () => {
        findV = false;
        digitsAfterV = 5;
        $scope.isProcessing = true;
        $timeout.cancel($scope.scanTimeout);
      };
      const flush = () => {
        $scope.isProcessing = false;
        values = '';
        processing = false;
      };

      /* const openScanningDialog = () => {
        return $uibModal.open({
          backdrop: 'static',
          template: mdlLineRejection,
          controller: ['$scope', '$uibModalInstance', ($scope, $uibModalInstance) => {
            'ngInject';
            $scope.extraInfo = {};
            $scope.submit = () => {
              $uibModalInstance.close($scope.extraInfo);
            };
            $scope.$uibModalInstance = $uibModalInstance;
          }]
        }).result;
      }; */

      /* const processApi = (code) => {
        ApiService.ncmr.fabrication.findLineInfo(code).then(rows => {
          let bigOb = [];
          openScanningDialog().then((oneline) => {
            for (let row of rows) {
              const depth = row.parameters.split('=')[1];
              const key = [row.ordernumber, row.framenumber, row.materialcode, row.color, row.width, row.height, depth].join('|');
              let ob = {};
              ob.ordernumber = row.ordernumber;
              ob.frame_number = row.framenumber;
              ob.material = row.materialcode;
              ob.colour = row.color;
              ob.project_name = row.ProjectName;
              ob.project_id = row.ProjectID;
              ob.list_number = row.processreference;
              ob.width = row.width;
              ob.height = row.height;
              ob.depth = depth;
              ob.rejected_reason = oneline.rejected_reason;
              ob.rejected = oneline.rejected;
              ob.barcode = code;
              ob.hash_code = HashService.hash(key);
              bigOb.push(ob);
            }
            $scope.$emit('autoAddlineFromScan', bigOb);
          });
        });
      }; */

      const processApi = (code) => {
        ApiService.ncmr.fabrication.findLineInfo(code).then(rows => {
          let bigOb = [];
          for (let row of rows) {
            const depth = row.parameters.split('=')[1];
            const key = [row.ordernumber, row.framenumber, row.materialcode, row.color, row.width, row.height, depth].join('|');
            let ob = {};
            ob.ordernumber = row.ordernumber;
            ob.frame_number = row.framenumber;
            ob.material = row.materialcode;
            ob.colour = row.color;
            ob.project_name = row.ProjectName;
            ob.project_id = row.ProjectID;
            ob.list_number = row.processreference;
            ob.width = row.width;
            ob.height = row.height;
            ob.depth = depth;
            ob.barcode = code;
            ob.hash_code = HashService.hash(key);
            bigOb.push(ob);
          }
          $scope.$emit('checkDup', bigOb);
        });
      };

      const process = (values) => {

        $scope.isProcessing = false;
        // process
        if (codeValidation(values)) {
          processApi(values);
        }
        flush();
        $timeout.cancel($scope.scanTimeout);

      };
      const processRemain = () => {
        if ($scope.isProcessing) {
          if (!processing) {
            processing = true;
            process(values);
          }
        }
        flush();
      };

      const keyupHandler = (e) => {
        if (!$scope.manualEntry) {
          // process
          const keycode = e.which || e.keyCode;
          const keyvalue = String.fromCharCode(keycode);

          switch (keycode) {
              case 48:
              case 49:
              case 50:
              case 51:
              case 52:
              case 53:
              case 54:
              case 55:
              case 56:
              case 57:
              case 80: // p +  digits (0 to 9)
                if ($scope.isProcessing) {
                  values += keyvalue;
                  if (findV) {
                    digitsAfterV--;
                  }
                  if (findV && digitsAfterV === 0 && !processing) {
                    processing = true;
                    process(values);
                  }
                }
                break;
              case 88: // x
                if (!$scope.isProcessing) {
                  startup();
                  values += keyvalue;
                }
                break;
              case 86: // v
                if ($scope.isProcessing) {
                  values += keyvalue;
                  findV = true;
                  $scope.scanTimeout = $timeout(processRemain, refreshTime);
                }
                break;
              default:
                break;
          }
        }
      };

      $window.addEventListener('keydown', keyupHandler);
      $scope.$on('$destroy', () => {
        $timeout.cancel(flush);
        $window.removeEventListener('keyup', keyupHandler);
        $window.removeEventListener('blur', null);
        $window.removeEventListener('focus', null);
      });
    }
  };
}
