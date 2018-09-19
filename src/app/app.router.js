import tplApp from './app.html';
import tplHeader from './header.html';

/**
 * Application route definition.
 */
export default function appRouter($stateProvider, $urlRouterProvider) {
  'ngInject';

  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('home', {
      url: '/',
      views: {
        header: {
          template: tplHeader
        },
        content: {
          template: tplApp
        }
      }
    });
}

