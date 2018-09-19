import template from './ncmr.internal.details.html';

export default function NcmrInternalDetails() {
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
