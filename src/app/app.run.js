export default function($log, $rootScope, $timeout, $localStorage, $sessionStorage, $state, $stateParams, $transitions, $window, ApiService, AppSettings, AuthService) {
  'ngInject';

  $rootScope.AppSettings = AppSettings;
  $rootScope.$state = $state;
  $rootScope.$localStorage = $localStorage;

  if (!$localStorage.appVersion || $localStorage.appVersion !== AppSettings.appVersion) {
    $localStorage.showChangeLog = true;
    $localStorage.appVersion = AppSettings.appVersion;
  }

  const loginRequired = () => {
    if ($state.current.name) {
      $sessionStorage.intendedRoute = { name: $state.current.name, params: $stateParams };
    } else {
      $sessionStorage.intendedRoute = { name: 'home', params: {} };
    }

    $timeout(() => $state.go('auth.login'));
  };

  AuthService.check();
  if (AuthService.authenticated) {
    $timeout(AuthService.refresh, 5000);
  } else {
    $timeout(() => $state.go('auth.login'));
  }

  $rootScope.$on('token_blacklisted', loginRequired);
  $rootScope.$on('token_expired', loginRequired);
  $rootScope.$on('token_invalid', loginRequired);

  $transitions.onStart({}, transition => {
    const $state = transition.router.stateService;
    const toState = transition.$to();

    if (toState.name === 'auth.logout') {
      AuthService.reset();
      return $state.target('auth.login');
    }

    if (toState.name === 'auth.login' || toState.name === 'auth.not-authorized') {
      // always allowed
      return;
    }

    $rootScope.loading = true;
    if (AuthService.authenticated) {
      ApiService.ncmr.getLookups().then(response => {
        $rootScope.lookups = response;
      });

      // Authenticated: check authorizations
      if ($sessionStorage.auth.memberOf) {
        const groups = $sessionStorage.auth.memberOf.split(',');
        if (groups.indexOf('Management') !== -1) {
          return; // Authorized
        }

        if (groups.indexOf('Quality Assurance') !== -1) {
          return; // Authorized
        }
      }

      if ($sessionStorage.auth.authorizations) {
        if ($sessionStorage.auth.authorizations.hasOwnProperty('quality.pqp.edit') &&
          $sessionStorage.auth.authorizations['quality.pqp.edit'] === 1) {
          return; // Authorized
        }
      }


      // Not authorized
      $log.info('Not authorized!');
      $rootScope.loading = false;
      return $state.target('auth.not-authorized');
    }

    // Not authenticated: redirect to login page
    $log.info('Not authenticated');
    return $state.target('auth.login');
  });

  // change page title based on state
  $transitions.onSuccess({}, transition => {
    const toState = transition.$to();

    $rootScope.loading = false;
    $rootScope.pageTitle = '';

    if (toState.title) {
      $rootScope.pageTitle += toState.title;
      $rootScope.pageTitle += ' — ';
    }

    $rootScope.pageTitle += AppSettings.appTitle;
  });

  $rootScope.navLockedOpen = angular.element($window).width() >= 768;
  angular.element($window).on('resize', () => {
    $rootScope.$apply(() => {
      $rootScope.navLockedOpen = angular.element($window).width() >= 768;
    });
  });

  $rootScope.$watch(() => {
    if (!($sessionStorage.auth && $sessionStorage.auth.user) || $sessionStorage.auth.user === null) {
      return null;
    }

    return $sessionStorage.auth.user.full_name;
  }, value => {
    $rootScope.userFullName = value;
  });
}
