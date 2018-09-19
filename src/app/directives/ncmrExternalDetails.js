import template from './ncmr.external.details.html';

export default function NcmrExternalDetails() {
  return {
    template,
    restrict: 'EA',
    scope: { ncmr: '=', selected: '=' },
    controller: $scope => {
      'ngInject';

      $scope.selectLine = line => {
        if (!$scope.selected) {
          return;
        }
        $scope.selected[line.hash_code] = !$scope.selected[line.hash_code];
      };
    }
  };
}
