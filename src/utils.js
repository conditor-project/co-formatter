const _ = require('lodash');

/**
 * Modifies `value` by modifying it according to the Regexp info in `metadataRegexp`.
 * @param {object} metadataRegexp The Regexp info coming from `co-config`.
 * @param {string} value The string that will get modified according to `metadataRegexp`.
 * @returns `value` after being modified.
 */
function matchRegExp (metadataRegexp, value) {
  if (isNonEmptyString(metadataRegexp.regexp)) {
    const regexp = new RegExp(metadataRegexp.regexp, metadataRegexp.flag);

    return value.replace(regexp, metadataRegexp.replace);
  }
}

/**
 * Returns `true` if `value` is an object containing at least one key-value pair, `false` otherwise.
 * @param {any} value The value to check.
 * @returns `true` if `value` is an object containing at least one key-value pair, `false` otherwise.
 */
function isNonEmptyObject (value) {
  return _.isPlainObject(value) && !_.isEmpty(value);
}

/**
 * Returns `true` if `value` is an array containing at least one element, `false` otherwise.
 * @param {any} value The value to check.
 * @returns `true` if `value` is an array containing at least one element, `false` otherwise.
 */
function isNonEmptyArray (value) {
  return _.isArray(value) && !_.isEmpty(value);
}

/**
 * Returns `true` if `value` is a string containing at least one character, `false` otherwise.
 * @param {any} value The value to check.
 * @returns `true` if `value` is a string containing at least one character, `false` otherwise.
 */
function isNonEmptyString (value) {
  return _.isString(value) && !_.isEmpty(value);
}

/**
 * Creates an object with a key `keyName` of value `value`.
 * @param {string} keyName The name of the object's key the value will be in.
 * @param {any} value The value to wrap in an object.
 */
function wrapInObject (keyName, value) {
  const obj = {};
  obj[keyName] = value;

  return obj;
}

/**
 * Uses the information from `originalErr` to populate `docObject` then modifies `originalErr` before returning it.
 * @param {object} docObject The docObject.
 * @param {string} errName The name of the error.
 * @param {Error} originalErr The `Error` instance that will be modified then returned.
 * @returns The modified `Error` instance.
 */
function handleError (docObject, errName, originalErr) {
  if (!errName) errName = 'Error';

  docObject.errCode = errName;
  docObject.errMsg = originalErr.message;

  originalErr.name = errName;

  return originalErr;
}

module.exports = {
  matchRegExp,
  isNonEmptyObject,
  isNonEmptyArray,
  isNonEmptyString,
  wrapInObject,
  handleError,
};
