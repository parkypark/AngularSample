/**
 * Application configuration.
 */
export default function(ENVIRONNEMENT, $compileProvider, $httpProvider, $locationProvider, jwtOptionsProvider, toastrConfig) {
  'ngInject';

  jwtOptionsProvider.config({
    whiteListedDomains: [
      'projects.starlinewindows.com',
      'localhost',
      '192.168.102.118'
    ],
    tokenGetter: ['options', 'jwtHelper', '$sessionStorage', '$rootScope', function(options, jwtHelper, $sessionStorage, $rootScope) {
      if (options.url.indexOf('/api') === -1) {
        return null;
      }

      if (!$sessionStorage.auth.token) {
        return null;
      }

      if (!jwtHelper.isTokenExpired($sessionStorage.auth.token)) {
        return $sessionStorage.auth.token;
      }

      $rootScope.$emit('token_expired');
    }]
  });

  toastrConfig.target = '.container';

  $httpProvider.interceptors.push('jwtInterceptor');
  $httpProvider.interceptors.push('httpErrorInterceptor');
  $httpProvider.useLegacyPromiseExtensions = false;

  $locationProvider.html5Mode(false);

  // Reference : http://blog.thoughtram.io/angularjs/2014/12/22/exploring-angular-1.3-disabling-debug-info.html
  $compileProvider.debugInfoEnabled(ENVIRONNEMENT !== 'prod' && ENVIRONNEMENT !== 'production');
}