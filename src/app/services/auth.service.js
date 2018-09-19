export default AuthService;

/** @ngInject */
function AuthService($rootScope, $timeout, $q, $sessionStorage, jwtHelper, ApiService) {
  const moment = require('moment');
  const service = {};

  const getRefreshTimeout = token => {
    // A refreshed token will be requested every 5 minutes or 20
    const tokenExpires = jwtHelper.getTokenExpirationDate(token);
    const diff = moment.duration(moment(tokenExpires).diff(moment(new Date()))).asMilliseconds();
    return Math.min(5 * 60 * 1000, diff - 20000);
  };

  const getUserDetails = () => {
    const deferred = $q.defer();
    ApiService.auth.getUserDetails().then(response => {
      service.user = $sessionStorage.auth.user = response;
      service.authorizations = $sessionStorage.auth.authorizations = service.user.permissions;
      service.memberOf = $sessionStorage.auth.memberOf = service.user.memberOf;
      deferred.resolve();
    }, deferred.reject);
    return deferred.promise;
  };

  service.authenticate = credentials => {
    $rootScope.loading = true;
    service.reset();

    const deferred = $q.defer();

    ApiService.auth.getAccessToken(credentials).then(response => {
      if (!(response && response.token)) {
        $rootScope.loading = false;
        return deferred.reject(response);
      }

      $sessionStorage.auth.username = credentials.username;
      $sessionStorage.auth.token = response.token;
      service.authenticated = true;

      getUserDetails().then(() => {
        // Begin token refresh loop
        $timeout(service.refresh, getRefreshTimeout(response.token));
        $rootScope.loading = false;
        deferred.resolve(true);
      });
    }, response => {
      // error
      $rootScope.loading = false;
      deferred.reject(response);
    });

    return deferred.promise;
  };

  service.check = () => {
    if (!$sessionStorage.auth) {
      $sessionStorage.auth = {
        authorizations: null,
        memberOf: null,
        token: null,
        username: null
      };
    }

    if ($sessionStorage.auth.token) {
      service.authenticated = !jwtHelper.isTokenExpired($sessionStorage.auth.token);
    } else {
      service.authenticated = false;
    }
  };

  service.refresh = () => {
    service.check();
    if (!service.authenticated) {
      return;
    }

    ApiService.auth.refreshAccessToken().then(response => {
      $sessionStorage.auth.token = response.token;
      service.authenticated = true;

      getUserDetails().then(() => {
        service.updateTimeout = $timeout(service.refresh, getRefreshTimeout(response.token));
      });
    }, () => {
      service.reset();
    });
  };

  service.reset = () => {
    if (service.updateTimeout) {
      $timeout.cancel(service.updateTimeout);
    }

    $sessionStorage.auth = {
      authorizations: null,
      memberOf: null,
      token: null,
      username: null,
      user: null
    };
    service.authenticated = false;
  };

  return service;
}
