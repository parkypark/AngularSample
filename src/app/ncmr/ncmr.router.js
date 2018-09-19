import tplHeader from '../header.html';

export default function ncmrRouter($stateProvider) {
  'ngInject';

  $stateProvider.state('ncmr', {
    url: '/ncmr',
    abstract: true,
    views: {
      header: {
        template: tplHeader
      },
      content: {
        template: '<div ui-view></div>'
      }
    }
  });
}
