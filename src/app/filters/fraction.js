import _ from 'lodash';
import fraction from 'fraction.js';

export default function FractionFilter() {
  return _.memoize(input => {
    if (angular.isUndefined(input) || input === null || input.length === 0) {
      return '0';
    }

    let val = parseFloat(input.toString());
    val = Math.round(val * 16) / 16;

    return fraction(val).toFraction(true);
  });
}
