import _ from 'lodash';

export default function Lookup($rootScope) {
  'ngInject';

  return _.memoize((input, lookupName) => {
    if (angular.isUndefined(input) || input === null || input.length === 0) {
      return null;
    }

    const found = _.find($rootScope.lookups[lookupName], { id: input });
    return found.description;
  }, (input, lookupName) => {
    return lookupName + '.' + input;
  });
}
