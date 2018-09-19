export default function HttpErrorInterceptorService($rootScope) {
  'ngInject';

  const checkForErrors = response => {
    if (response.status === 400 || response.status === 401) {
      if (response.data.error && response.data.error.indexOf('token') > -1) {
        if (response.data.error.indexOf('blacklisted') > -1) {
          $rootScope.$emit('token_blacklisted');
        } else {
          $rootScope.$emit(response.data.error);
        }
      }
    }

    return response;
  };

  return {
    response: checkForErrors,
    responseError: checkForErrors
  };
}
