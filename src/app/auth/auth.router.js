import tplLogin from './login.html';
import tplNotAuthorized from './not-authorized.html';

export default function authRouter($stateProvider) {
  'ngInject';

  $stateProvider
    .state('auth', {
      abstract: true,
      template: '<div ui-view></div>'
    })
    .state('auth.login', {
      url: '/auth/login',
      views: {
        'content@': {
          template: tplLogin,
          controller: 'LoginController'
        }
      }
    })
    .state('auth.logout', {
      // logic for this route in $onStateChangeStart event handler (../app.run.js)
      url: '/auth/logout'
    })
    .state('auth.not-authorized', {
      views: {
        'content@': {
          template: tplNotAuthorized
        }
      }
    });
}
