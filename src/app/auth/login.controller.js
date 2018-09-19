export default LoginController;

/** @ngInject */
function LoginController($scope, $sessionStorage, $state, AuthService) {
  $scope.login = {};

  $scope.performLogin = () => {
    AuthService.authenticate($scope.login).then(() => {
      $state.go('home');
    }, response => {
      if (angular.isDefined(response) && angular.isDefined(response.messages)) {
        $scope.messages = response.messages;
      } else {
        $scope.messages = [{ type: 'danger', message: 'Login failed' }];
      }
    });
  };
}
