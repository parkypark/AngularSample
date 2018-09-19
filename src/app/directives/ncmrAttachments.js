import _ from 'lodash';

import mdlConfirmDelete from '../modals/confirm_delete.html';
import tplAttachments from './ncmr.attachments.html';
import tplViewAttachment from './view_attachment.html';

export default function NcmrAttachments() {
  return {
    restrict: 'EA',
    template: tplAttachments,
    scope: { ncmr: '=' },
    controller: ($scope, $uibModal) => {
      'ngInject';
      const initSelected = () => {
        $scope.selected = {};
        angular.forEach($scope.ncmr.attachments, a => {
          $scope.selected[a.name] = false;
        });
      };
      initSelected();

      $scope.hasSelected = () => {
        return _.some($scope.selected, value => {
          return value;
        });
      };

      $scope.deleteSelected = () => {
        $uibModal.open({
          backdrop: 'static',
          template: mdlConfirmDelete,
          controller: ($scope, $uibModalInstance) => {
            'ngInject';
            $scope.$modalInstance = $uibModalInstance;
            $scope.title = 'Delete Attachments';
            $scope.what = 'the selected attachments';
          }
        }).result.then(() => {
          $scope.ncmr.attachments = $scope.ncmr.attachments.filter(value => {
            return !$scope.selected[value.name];
          });
          initSelected();
        });
      };

      $scope.showAttachment = attachment => {
        $uibModal.open({
          controller: ($scope, $uibModalInstance, attachment) => {
            'ngInject';
            $scope.attachment = attachment;
            $scope.$uibModalInstance = $uibModalInstance;
          },
          resolve: { attachment },
          size: 'lg',
          template: tplViewAttachment
        });
      };
    }
  };
}
