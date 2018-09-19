import template from './ncmr.panel.details.html';

export default function NcmrPanelDetails() {
  return {
    template,
    restrict: 'EA',
    scope: { ncmr: '=', selected: '=' },
    controller: ['$scope', $scope => {
      $scope.selectLine = line => {
        if (!$scope.selected) {
          return;
        }
        $scope.selected[line.hash_code] = !$scope.selected[line.hash_code];
      };
    }]
  };
}
