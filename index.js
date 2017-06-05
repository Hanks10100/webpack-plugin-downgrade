'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var crypto = _interopDefault(require('crypto'));

function unwrapExports (x) {
	return x && x.__esModule ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var __moduleExports = createCommonjsModule(function (module, exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = {
	satisfies: function satisfies(left, right) {
		var regex = /(\W+)?([\d|.]+)/;

		if ((typeof left === 'undefined' ? 'undefined' : _typeof(left)) + (typeof right === 'undefined' ? 'undefined' : _typeof(right)) !== 'stringstring') { return false; }

		// *匹配所有
		if (right == '*') {
			return true;
		}

		var arr = right.match(regex);
		var a = left.split('.');
		var i = 0;
		var b = arr[2].split('.');
		var len = Math.max(a.length, b.length);

		var flag = 0;
		for (var _i = 0; _i < len; _i++) {
			if (a[_i] && !b[_i] && parseInt(a[_i]) > 0 || parseInt(a[_i]) > parseInt(b[_i])) {
				flag = 1;
				break;
			} else if (b[_i] && !a[_i] && parseInt(b[_i]) > 0 || parseInt(a[_i]) < parseInt(b[_i])) {
				flag = -1;
				break;
			}
		}

		switch (arr[1]) {
			case '<':
				if (flag === -1) {
					return true;
				}
				break;
			case '<=':
				if (flag !== 1) {
					return true;
				}
				break;
			case '>':
				if (flag === 1) {
					return true;
				}
				break;
			case '>=':
				if (flag !== -1) {
					return true;
				}
				break;
			default:
				if (flag === 0) {
					return true;
				}
				break;
		}

		return false;
	}
};
});

unwrapExports(__moduleExports);

var index = createCommonjsModule(function (module, exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /* global WXEnvironment, weex, callNative */



var _semver2 = _interopRequireDefault(__moduleExports);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MODULE_NAME = 'instanceWrap';
var DOWNGRADE_TYPE = 1;
var DOWNGRADE_ERROR_CODE = 1003;
var DOWNGRADE_MSG = 'Force downgrade to web';

/**
 * @private
 * Using async type to check environment
 */
function isWeex() {
    return (typeof window === 'undefined' ? 'undefined' : _typeof(window)) !== 'object' && typeof callNative !== 'undefined';
}

/**
 * @private
 * Require module and fixed lagacy version require issues.
 */
function getInstanceWrap() {
    var prefix = '@weex-module/';

    try {
        return weex.requireModule(MODULE_NAME);
    } catch (e) {}

    try {
        return __weex_require__(prefix + MODULE_NAME);
    } catch (e) {}

    return { error: function error() {
            console && console.log && console.log('Can not found module ' + MODULE_NAME);
        } };
}

function force(type, errorCode, message) {
    if (!isWeex()) { return false; }
    type = parseInt(type) || DOWNGRADE_TYPE;
    errorCode = parseInt(errorCode) || DOWNGRADE_ERROR_CODE;
    message = isString(message) ? message : DOWNGRADE_MSG;
    getInstanceWrap()['error'](type, errorCode, message);
    return true;
}

/**
 * config
 *
 * {
 *   ios: {
 *     osVersion: '>1.0.0' or '>=1.0.0' or '<1.0.0' or '<=1.0.0' or '1.0.0'
 *     appVersion: '>1.0.0' or '>=1.0.0' or '<1.0.0' or '<=1.0.0' or '1.0.0'
 *     weexVersion: '>1.0.0' or '>=1.0.0' or '<1.0.0' or '<=1.0.0' or '1.0.0'
 *     deviceModel: ['modelA', 'modelB', ...]
 *   },
 *   android: {
 *     osVersion: '>1.0.0' or '>=1.0.0' or '<1.0.0' or '<=1.0.0' or '1.0.0'
 *     appVersion: '>1.0.0' or '>=1.0.0' or '<1.0.0' or '<=1.0.0' or '1.0.0'
 *     weexVersion: '>1.0.0' or '>=1.0.0' or '<1.0.0' or '<=1.0.0' or '1.0.0'
 *     deviceModel: ['modelA', 'modelB', ...]
 *   }
 * }
 *
 */
function check(config) {
    var result = {
        isDowngrade: false
    };

    if (!isWeex()) {
        return result;
    }

    var deviceInfo = WXEnvironment || {};

    var platform = deviceInfo.platform || 'unknow';
    var dPlatform = platform.toLowerCase();
    var cObj = config[dPlatform] || {};

    for (var key in deviceInfo) {
        var keyLower = key.toLowerCase();
        var val = deviceInfo[key];
        var isVersion = keyLower.indexOf('version') >= 0;
        var isDeviceModel = keyLower.indexOf('devicemodel') >= 0;
        var criteria = cObj[key];

        if (criteria && isVersion) {
            var c = normalizeVersion(criteria);
            var d = normalizeVersion(deviceInfo[key]);

            if (_semver2.default.satisfies(d, c)) {
                result = getError(key, val, criteria);
                break;
            }
        } else if (isDeviceModel) {
            var _criteria = Array.isArray(criteria) ? criteria : [criteria];

            if (_criteria.indexOf(val) >= 0) {
                result = getError(key, val, criteria);
                break;
            }
        }
    }

    return result;
}

function isString(v) {
    return typeof v === 'string';
}

function normalizeVersion(v) {
    if (v === '*') {
        return v;
    }

    v = isString(v) ? v : '';
    var split = v.split('.');
    var i = 0;
    var result = [];

    while (i < 3) {
        var s = isString(split[i]) && split[i] ? split[i] : '0';
        result.push(s);
        i++;
    }

    return result.join('.');
}

function getError(key, val, criteria) {
    var result = {
        isDowngrade: true,
        errorType: 1,
        code: 1000
    };

    var getMsg = function getMsg(key, val, criteria) {
        return 'Downgrade[' + key + ']: envInfo ' + val + ' matched criteria ' + criteria;
    };
    var _key = key.toLowerCase();

    if (_key.indexOf('osversion') >= 0) {
        result.code = 1001;
    } else if (_key.indexOf('appversion') >= 0) {
        result.code = 1002;
    } else if (_key.indexOf('weexversion') >= 0) {
        result.code = 1003;
    } else if (_key.indexOf('devicemodel') >= 0) {
        result.code = 1004;
    }

    result.errorMessage = getMsg(key, val, criteria);
    return result;
}

function condition(config) {
    var diagnose = check(config);
    if (diagnose.isDowngrade) {
        force(diagnose.errorType, diagnose.code, diagnose.errorMessage);
    }

    return diagnose.isDowngrade;
}

exports.default = {
    force: force,
    check: check,
    condition: condition,
    semverLite: _semver2.default
};
});

unwrapExports(index);

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var intToCharMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

/**
 * Encode an integer in the range of 0 to 63 to a single base 64 digit.
 */
var encode$1 = function (number) {
  if (0 <= number && number < intToCharMap.length) {
    return intToCharMap[number];
  }
  throw new TypeError("Must be between 0 and 63: " + number);
};

/**
 * Decode a single base 64 character code digit to an integer. Returns -1 on
 * failure.
 */
var decode$1 = function (charCode) {
  var bigA = 65;     // 'A'
  var bigZ = 90;     // 'Z'

  var littleA = 97;  // 'a'
  var littleZ = 122; // 'z'

  var zero = 48;     // '0'
  var nine = 57;     // '9'

  var plus = 43;     // '+'
  var slash = 47;    // '/'

  var littleOffset = 26;
  var numberOffset = 52;

  // 0 - 25: ABCDEFGHIJKLMNOPQRSTUVWXYZ
  if (bigA <= charCode && charCode <= bigZ) {
    return (charCode - bigA);
  }

  // 26 - 51: abcdefghijklmnopqrstuvwxyz
  if (littleA <= charCode && charCode <= littleZ) {
    return (charCode - littleA + littleOffset);
  }

  // 52 - 61: 0123456789
  if (zero <= charCode && charCode <= nine) {
    return (charCode - zero + numberOffset);
  }

  // 62: +
  if (charCode == plus) {
    return 62;
  }

  // 63: /
  if (charCode == slash) {
    return 63;
  }

  // Invalid base64 digit.
  return -1;
};

var __moduleExports$5 = {
	encode: encode$1,
	decode: decode$1
};

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on the Base 64 VLQ implementation in Closure Compiler:
 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
 *
 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of Google Inc. nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */



// A single base 64 digit can contain 6 bits of data. For the base 64 variable
// length quantities we use in the source map spec, the first bit is the sign,
// the next four bits are the actual value, and the 6th bit is the
// continuation bit. The continuation bit tells us whether there are more
// digits in this value following this digit.
//
//   Continuation
//   |    Sign
//   |    |
//   V    V
//   101011

var VLQ_BASE_SHIFT = 5;

// binary: 100000
var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

// binary: 011111
var VLQ_BASE_MASK = VLQ_BASE - 1;

// binary: 100000
var VLQ_CONTINUATION_BIT = VLQ_BASE;

/**
 * Converts from a two-complement value to a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
 *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
 */
function toVLQSigned(aValue) {
  return aValue < 0
    ? ((-aValue) << 1) + 1
    : (aValue << 1) + 0;
}

/**
 * Converts to a two-complement value from a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
 *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
 */
function fromVLQSigned(aValue) {
  var isNegative = (aValue & 1) === 1;
  var shifted = aValue >> 1;
  return isNegative
    ? -shifted
    : shifted;
}

/**
 * Returns the base 64 VLQ encoded value.
 */
var encode = function base64VLQ_encode(aValue) {
  var encoded = "";
  var digit;

  var vlq = toVLQSigned(aValue);

  do {
    digit = vlq & VLQ_BASE_MASK;
    vlq >>>= VLQ_BASE_SHIFT;
    if (vlq > 0) {
      // There are still more digits in this value, so we must make sure the
      // continuation bit is marked.
      digit |= VLQ_CONTINUATION_BIT;
    }
    encoded += __moduleExports$5.encode(digit);
  } while (vlq > 0);

  return encoded;
};

/**
 * Decodes the next base 64 VLQ value from the given string and returns the
 * value and the rest of the string via the out parameter.
 */
var decode = function base64VLQ_decode(aStr, aIndex, aOutParam) {
  var strLen = aStr.length;
  var result = 0;
  var shift = 0;
  var continuation, digit;

  do {
    if (aIndex >= strLen) {
      throw new Error("Expected more digits in base 64 VLQ value.");
    }

    digit = __moduleExports$5.decode(aStr.charCodeAt(aIndex++));
    if (digit === -1) {
      throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
    }

    continuation = !!(digit & VLQ_CONTINUATION_BIT);
    digit &= VLQ_BASE_MASK;
    result = result + (digit << shift);
    shift += VLQ_BASE_SHIFT;
  } while (continuation);

  aOutParam.value = fromVLQSigned(result);
  aOutParam.rest = aIndex;
};

var __moduleExports$4 = {
	encode: encode,
	decode: decode
};

var __moduleExports$6 = createCommonjsModule(function (module, exports) {
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

/**
 * This is a helper function for getting values from parameter/options
 * objects.
 *
 * @param args The object we are extracting values from
 * @param name The name of the property we are getting.
 * @param defaultValue An optional value to return if the property is missing
 * from the object. If this is not specified and the property is missing, an
 * error will be thrown.
 */
function getArg(aArgs, aName, aDefaultValue) {
  if (aName in aArgs) {
    return aArgs[aName];
  } else if (arguments.length === 3) {
    return aDefaultValue;
  } else {
    throw new Error('"' + aName + '" is a required argument.');
  }
}
exports.getArg = getArg;

var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.]*)(?::(\d+))?(\S*)$/;
var dataUrlRegexp = /^data:.+\,.+$/;

function urlParse(aUrl) {
  var match = aUrl.match(urlRegexp);
  if (!match) {
    return null;
  }
  return {
    scheme: match[1],
    auth: match[2],
    host: match[3],
    port: match[4],
    path: match[5]
  };
}
exports.urlParse = urlParse;

function urlGenerate(aParsedUrl) {
  var url = '';
  if (aParsedUrl.scheme) {
    url += aParsedUrl.scheme + ':';
  }
  url += '//';
  if (aParsedUrl.auth) {
    url += aParsedUrl.auth + '@';
  }
  if (aParsedUrl.host) {
    url += aParsedUrl.host;
  }
  if (aParsedUrl.port) {
    url += ":" + aParsedUrl.port
  }
  if (aParsedUrl.path) {
    url += aParsedUrl.path;
  }
  return url;
}
exports.urlGenerate = urlGenerate;

/**
 * Normalizes a path, or the path portion of a URL:
 *
 * - Replaces consecutive slashes with one slash.
 * - Removes unnecessary '.' parts.
 * - Removes unnecessary '<dir>/..' parts.
 *
 * Based on code in the Node.js 'path' core module.
 *
 * @param aPath The path or url to normalize.
 */
function normalize(aPath) {
  var path = aPath;
  var url = urlParse(aPath);
  if (url) {
    if (!url.path) {
      return aPath;
    }
    path = url.path;
  }
  var isAbsolute = exports.isAbsolute(path);

  var parts = path.split(/\/+/);
  for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
    part = parts[i];
    if (part === '.') {
      parts.splice(i, 1);
    } else if (part === '..') {
      up++;
    } else if (up > 0) {
      if (part === '') {
        // The first part is blank if the path is absolute. Trying to go
        // above the root is a no-op. Therefore we can remove all '..' parts
        // directly after the root.
        parts.splice(i + 1, up);
        up = 0;
      } else {
        parts.splice(i, 2);
        up--;
      }
    }
  }
  path = parts.join('/');

  if (path === '') {
    path = isAbsolute ? '/' : '.';
  }

  if (url) {
    url.path = path;
    return urlGenerate(url);
  }
  return path;
}
exports.normalize = normalize;

/**
 * Joins two paths/URLs.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be joined with the root.
 *
 * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
 *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
 *   first.
 * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
 *   is updated with the result and aRoot is returned. Otherwise the result
 *   is returned.
 *   - If aPath is absolute, the result is aPath.
 *   - Otherwise the two paths are joined with a slash.
 * - Joining for example 'http://' and 'www.example.com' is also supported.
 */
function join(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }
  if (aPath === "") {
    aPath = ".";
  }
  var aPathUrl = urlParse(aPath);
  var aRootUrl = urlParse(aRoot);
  if (aRootUrl) {
    aRoot = aRootUrl.path || '/';
  }

  // `join(foo, '//www.example.org')`
  if (aPathUrl && !aPathUrl.scheme) {
    if (aRootUrl) {
      aPathUrl.scheme = aRootUrl.scheme;
    }
    return urlGenerate(aPathUrl);
  }

  if (aPathUrl || aPath.match(dataUrlRegexp)) {
    return aPath;
  }

  // `join('http://', 'www.example.com')`
  if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
    aRootUrl.host = aPath;
    return urlGenerate(aRootUrl);
  }

  var joined = aPath.charAt(0) === '/'
    ? aPath
    : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);

  if (aRootUrl) {
    aRootUrl.path = joined;
    return urlGenerate(aRootUrl);
  }
  return joined;
}
exports.join = join;

exports.isAbsolute = function (aPath) {
  return aPath.charAt(0) === '/' || !!aPath.match(urlRegexp);
};

/**
 * Make a path relative to a URL or another path.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be made relative to aRoot.
 */
function relative(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }

  aRoot = aRoot.replace(/\/$/, '');

  // It is possible for the path to be above the root. In this case, simply
  // checking whether the root is a prefix of the path won't work. Instead, we
  // need to remove components from the root one by one, until either we find
  // a prefix that fits, or we run out of components to remove.
  var level = 0;
  while (aPath.indexOf(aRoot + '/') !== 0) {
    var index = aRoot.lastIndexOf("/");
    if (index < 0) {
      return aPath;
    }

    // If the only part of the root that is left is the scheme (i.e. http://,
    // file:///, etc.), one or more slashes (/), or simply nothing at all, we
    // have exhausted all components, so the path is not relative to the root.
    aRoot = aRoot.slice(0, index);
    if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
      return aPath;
    }

    ++level;
  }

  // Make sure we add a "../" for each component we removed from the root.
  return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
}
exports.relative = relative;

var supportsNullProto = (function () {
  var obj = Object.create(null);
  return !('__proto__' in obj);
}());

function identity (s) {
  return s;
}

/**
 * Because behavior goes wacky when you set `__proto__` on objects, we
 * have to prefix all the strings in our set with an arbitrary character.
 *
 * See https://github.com/mozilla/source-map/pull/31 and
 * https://github.com/mozilla/source-map/issues/30
 *
 * @param String aStr
 */
function toSetString(aStr) {
  if (isProtoString(aStr)) {
    return '$' + aStr;
  }

  return aStr;
}
exports.toSetString = supportsNullProto ? identity : toSetString;

function fromSetString(aStr) {
  if (isProtoString(aStr)) {
    return aStr.slice(1);
  }

  return aStr;
}
exports.fromSetString = supportsNullProto ? identity : fromSetString;

function isProtoString(s) {
  if (!s) {
    return false;
  }

  var length = s.length;

  if (length < 9 /* "__proto__".length */) {
    return false;
  }

  if (s.charCodeAt(length - 1) !== 95  /* '_' */ ||
      s.charCodeAt(length - 2) !== 95  /* '_' */ ||
      s.charCodeAt(length - 3) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 4) !== 116 /* 't' */ ||
      s.charCodeAt(length - 5) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 6) !== 114 /* 'r' */ ||
      s.charCodeAt(length - 7) !== 112 /* 'p' */ ||
      s.charCodeAt(length - 8) !== 95  /* '_' */ ||
      s.charCodeAt(length - 9) !== 95  /* '_' */) {
    return false;
  }

  for (var i = length - 10; i >= 0; i--) {
    if (s.charCodeAt(i) !== 36 /* '$' */) {
      return false;
    }
  }

  return true;
}

/**
 * Comparator between two mappings where the original positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same original source/line/column, but different generated
 * line and column the same. Useful when searching for a mapping with a
 * stubbed out mapping.
 */
function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
  var cmp = mappingA.source - mappingB.source;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0 || onlyCompareOriginal) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  return mappingA.name - mappingB.name;
}
exports.compareByOriginalPositions = compareByOriginalPositions;

/**
 * Comparator between two mappings with deflated source and name indices where
 * the generated positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same generated line and column, but different
 * source/name/original line and column the same. Useful when searching for a
 * mapping with a stubbed out mapping.
 */
function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0 || onlyCompareGenerated) {
    return cmp;
  }

  cmp = mappingA.source - mappingB.source;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return mappingA.name - mappingB.name;
}
exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;

function strcmp(aStr1, aStr2) {
  if (aStr1 === aStr2) {
    return 0;
  }

  if (aStr1 > aStr2) {
    return 1;
  }

  return -1;
}

/**
 * Comparator between two mappings with inflated source and name strings where
 * the generated positions are compared.
 */
function compareByGeneratedPositionsInflated(mappingA, mappingB) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;
});

var util_1 = __moduleExports$6.getArg;
var util_2 = __moduleExports$6.urlParse;
var util_3 = __moduleExports$6.urlGenerate;
var util_4 = __moduleExports$6.normalize;
var util_5 = __moduleExports$6.join;
var util_6 = __moduleExports$6.isAbsolute;
var util_7 = __moduleExports$6.relative;
var util_8 = __moduleExports$6.toSetString;
var util_9 = __moduleExports$6.fromSetString;
var util_10 = __moduleExports$6.compareByOriginalPositions;
var util_11 = __moduleExports$6.compareByGeneratedPositionsDeflated;
var util_12 = __moduleExports$6.compareByGeneratedPositionsInflated;

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */


var has = Object.prototype.hasOwnProperty;

/**
 * A data structure which is a combination of an array and a set. Adding a new
 * member is O(1), testing for membership is O(1), and finding the index of an
 * element is O(1). Removing elements from the set is not supported. Only
 * strings are supported for membership.
 */
function ArraySet$1() {
  this._array = [];
  this._set = Object.create(null);
}

/**
 * Static method for creating ArraySet instances from an existing array.
 */
ArraySet$1.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
  var set = new ArraySet$1();
  for (var i = 0, len = aArray.length; i < len; i++) {
    set.add(aArray[i], aAllowDuplicates);
  }
  return set;
};

/**
 * Return how many unique items are in this ArraySet. If duplicates have been
 * added, than those do not count towards the size.
 *
 * @returns Number
 */
ArraySet$1.prototype.size = function ArraySet_size() {
  return Object.getOwnPropertyNames(this._set).length;
};

/**
 * Add the given string to this set.
 *
 * @param String aStr
 */
ArraySet$1.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
  var sStr = __moduleExports$6.toSetString(aStr);
  var isDuplicate = has.call(this._set, sStr);
  var idx = this._array.length;
  if (!isDuplicate || aAllowDuplicates) {
    this._array.push(aStr);
  }
  if (!isDuplicate) {
    this._set[sStr] = idx;
  }
};

/**
 * Is the given string a member of this set?
 *
 * @param String aStr
 */
ArraySet$1.prototype.has = function ArraySet_has(aStr) {
  var sStr = __moduleExports$6.toSetString(aStr);
  return has.call(this._set, sStr);
};

/**
 * What is the index of the given string in the array?
 *
 * @param String aStr
 */
ArraySet$1.prototype.indexOf = function ArraySet_indexOf(aStr) {
  var sStr = __moduleExports$6.toSetString(aStr);
  if (has.call(this._set, sStr)) {
    return this._set[sStr];
  }
  throw new Error('"' + aStr + '" is not in the set.');
};

/**
 * What is the element at the given index?
 *
 * @param Number aIdx
 */
ArraySet$1.prototype.at = function ArraySet_at(aIdx) {
  if (aIdx >= 0 && aIdx < this._array.length) {
    return this._array[aIdx];
  }
  throw new Error('No element indexed by ' + aIdx);
};

/**
 * Returns the array representation of this set (which has the proper indices
 * indicated by indexOf). Note that this is a copy of the internal array used
 * for storing the members so that no one can mess with internal state.
 */
ArraySet$1.prototype.toArray = function ArraySet_toArray() {
  return this._array.slice();
};

var ArraySet_1 = ArraySet$1;

var __moduleExports$7 = {
	ArraySet: ArraySet_1
};

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2014 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */



/**
 * Determine whether mappingB is after mappingA with respect to generated
 * position.
 */
function generatedPositionAfter(mappingA, mappingB) {
  // Optimized for most common case
  var lineA = mappingA.generatedLine;
  var lineB = mappingB.generatedLine;
  var columnA = mappingA.generatedColumn;
  var columnB = mappingB.generatedColumn;
  return lineB > lineA || lineB == lineA && columnB >= columnA ||
         __moduleExports$6.compareByGeneratedPositionsInflated(mappingA, mappingB) <= 0;
}

/**
 * A data structure to provide a sorted view of accumulated mappings in a
 * performance conscious manner. It trades a neglibable overhead in general
 * case for a large speedup in case of mappings being added in order.
 */
function MappingList$1() {
  this._array = [];
  this._sorted = true;
  // Serves as infimum
  this._last = {generatedLine: -1, generatedColumn: 0};
}

/**
 * Iterate through internal items. This method takes the same arguments that
 * `Array.prototype.forEach` takes.
 *
 * NOTE: The order of the mappings is NOT guaranteed.
 */
MappingList$1.prototype.unsortedForEach =
  function MappingList_forEach(aCallback, aThisArg) {
    this._array.forEach(aCallback, aThisArg);
  };

/**
 * Add the given source mapping.
 *
 * @param Object aMapping
 */
MappingList$1.prototype.add = function MappingList_add(aMapping) {
  if (generatedPositionAfter(this._last, aMapping)) {
    this._last = aMapping;
    this._array.push(aMapping);
  } else {
    this._sorted = false;
    this._array.push(aMapping);
  }
};

/**
 * Returns the flat, sorted array of mappings. The mappings are sorted by
 * generated position.
 *
 * WARNING: This method returns internal data without copying, for
 * performance. The return value must NOT be mutated, and should be treated as
 * an immutable borrow. If you want to take ownership, you must make your own
 * copy.
 */
MappingList$1.prototype.toArray = function MappingList_toArray() {
  if (!this._sorted) {
    this._array.sort(__moduleExports$6.compareByGeneratedPositionsInflated);
    this._sorted = true;
  }
  return this._array;
};

var MappingList_1 = MappingList$1;

var __moduleExports$8 = {
	MappingList: MappingList_1
};

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */



var ArraySet = __moduleExports$7.ArraySet;
var MappingList = __moduleExports$8.MappingList;

/**
 * An instance of the SourceMapGenerator represents a source map which is
 * being built incrementally. You may pass an object with the following
 * properties:
 *
 *   - file: The filename of the generated source.
 *   - sourceRoot: A root for all relative URLs in this source map.
 */
function SourceMapGenerator$1(aArgs) {
  if (!aArgs) {
    aArgs = {};
  }
  this._file = __moduleExports$6.getArg(aArgs, 'file', null);
  this._sourceRoot = __moduleExports$6.getArg(aArgs, 'sourceRoot', null);
  this._skipValidation = __moduleExports$6.getArg(aArgs, 'skipValidation', false);
  this._sources = new ArraySet();
  this._names = new ArraySet();
  this._mappings = new MappingList();
  this._sourcesContents = null;
}

SourceMapGenerator$1.prototype._version = 3;

/**
 * Creates a new SourceMapGenerator based on a SourceMapConsumer
 *
 * @param aSourceMapConsumer The SourceMap.
 */
SourceMapGenerator$1.fromSourceMap =
  function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
    var sourceRoot = aSourceMapConsumer.sourceRoot;
    var generator = new SourceMapGenerator$1({
      file: aSourceMapConsumer.file,
      sourceRoot: sourceRoot
    });
    aSourceMapConsumer.eachMapping(function (mapping) {
      var newMapping = {
        generated: {
          line: mapping.generatedLine,
          column: mapping.generatedColumn
        }
      };

      if (mapping.source != null) {
        newMapping.source = mapping.source;
        if (sourceRoot != null) {
          newMapping.source = __moduleExports$6.relative(sourceRoot, newMapping.source);
        }

        newMapping.original = {
          line: mapping.originalLine,
          column: mapping.originalColumn
        };

        if (mapping.name != null) {
          newMapping.name = mapping.name;
        }
      }

      generator.addMapping(newMapping);
    });
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        generator.setSourceContent(sourceFile, content);
      }
    });
    return generator;
  };

/**
 * Add a single mapping from original source line and column to the generated
 * source's line and column for this source map being created. The mapping
 * object should have the following properties:
 *
 *   - generated: An object with the generated line and column positions.
 *   - original: An object with the original line and column positions.
 *   - source: The original source file (relative to the sourceRoot).
 *   - name: An optional original token name for this mapping.
 */
SourceMapGenerator$1.prototype.addMapping =
  function SourceMapGenerator_addMapping(aArgs) {
    var generated = __moduleExports$6.getArg(aArgs, 'generated');
    var original = __moduleExports$6.getArg(aArgs, 'original', null);
    var source = __moduleExports$6.getArg(aArgs, 'source', null);
    var name = __moduleExports$6.getArg(aArgs, 'name', null);

    if (!this._skipValidation) {
      this._validateMapping(generated, original, source, name);
    }

    if (source != null) {
      source = String(source);
      if (!this._sources.has(source)) {
        this._sources.add(source);
      }
    }

    if (name != null) {
      name = String(name);
      if (!this._names.has(name)) {
        this._names.add(name);
      }
    }

    this._mappings.add({
      generatedLine: generated.line,
      generatedColumn: generated.column,
      originalLine: original != null && original.line,
      originalColumn: original != null && original.column,
      source: source,
      name: name
    });
  };

/**
 * Set the source content for a source file.
 */
SourceMapGenerator$1.prototype.setSourceContent =
  function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
    var source = aSourceFile;
    if (this._sourceRoot != null) {
      source = __moduleExports$6.relative(this._sourceRoot, source);
    }

    if (aSourceContent != null) {
      // Add the source content to the _sourcesContents map.
      // Create a new _sourcesContents map if the property is null.
      if (!this._sourcesContents) {
        this._sourcesContents = Object.create(null);
      }
      this._sourcesContents[__moduleExports$6.toSetString(source)] = aSourceContent;
    } else if (this._sourcesContents) {
      // Remove the source file from the _sourcesContents map.
      // If the _sourcesContents map is empty, set the property to null.
      delete this._sourcesContents[__moduleExports$6.toSetString(source)];
      if (Object.keys(this._sourcesContents).length === 0) {
        this._sourcesContents = null;
      }
    }
  };

/**
 * Applies the mappings of a sub-source-map for a specific source file to the
 * source map being generated. Each mapping to the supplied source file is
 * rewritten using the supplied source map. Note: The resolution for the
 * resulting mappings is the minimium of this map and the supplied map.
 *
 * @param aSourceMapConsumer The source map to be applied.
 * @param aSourceFile Optional. The filename of the source file.
 *        If omitted, SourceMapConsumer's file property will be used.
 * @param aSourceMapPath Optional. The dirname of the path to the source map
 *        to be applied. If relative, it is relative to the SourceMapConsumer.
 *        This parameter is needed when the two source maps aren't in the same
 *        directory, and the source map to be applied contains relative source
 *        paths. If so, those relative source paths need to be rewritten
 *        relative to the SourceMapGenerator.
 */
SourceMapGenerator$1.prototype.applySourceMap =
  function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
    var sourceFile = aSourceFile;
    // If aSourceFile is omitted, we will use the file property of the SourceMap
    if (aSourceFile == null) {
      if (aSourceMapConsumer.file == null) {
        throw new Error(
          'SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, ' +
          'or the source map\'s "file" property. Both were omitted.'
        );
      }
      sourceFile = aSourceMapConsumer.file;
    }
    var sourceRoot = this._sourceRoot;
    // Make "sourceFile" relative if an absolute Url is passed.
    if (sourceRoot != null) {
      sourceFile = __moduleExports$6.relative(sourceRoot, sourceFile);
    }
    // Applying the SourceMap can add and remove items from the sources and
    // the names array.
    var newSources = new ArraySet();
    var newNames = new ArraySet();

    // Find mappings for the "sourceFile"
    this._mappings.unsortedForEach(function (mapping) {
      if (mapping.source === sourceFile && mapping.originalLine != null) {
        // Check if it can be mapped by the source map, then update the mapping.
        var original = aSourceMapConsumer.originalPositionFor({
          line: mapping.originalLine,
          column: mapping.originalColumn
        });
        if (original.source != null) {
          // Copy mapping
          mapping.source = original.source;
          if (aSourceMapPath != null) {
            mapping.source = __moduleExports$6.join(aSourceMapPath, mapping.source)
          }
          if (sourceRoot != null) {
            mapping.source = __moduleExports$6.relative(sourceRoot, mapping.source);
          }
          mapping.originalLine = original.line;
          mapping.originalColumn = original.column;
          if (original.name != null) {
            mapping.name = original.name;
          }
        }
      }

      var source = mapping.source;
      if (source != null && !newSources.has(source)) {
        newSources.add(source);
      }

      var name = mapping.name;
      if (name != null && !newNames.has(name)) {
        newNames.add(name);
      }

    }, this);
    this._sources = newSources;
    this._names = newNames;

    // Copy sourcesContents of applied map.
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        if (aSourceMapPath != null) {
          sourceFile = __moduleExports$6.join(aSourceMapPath, sourceFile);
        }
        if (sourceRoot != null) {
          sourceFile = __moduleExports$6.relative(sourceRoot, sourceFile);
        }
        this.setSourceContent(sourceFile, content);
      }
    }, this);
  };

/**
 * A mapping can have one of the three levels of data:
 *
 *   1. Just the generated position.
 *   2. The Generated position, original position, and original source.
 *   3. Generated and original position, original source, as well as a name
 *      token.
 *
 * To maintain consistency, we validate that any new mapping being added falls
 * in to one of these categories.
 */
SourceMapGenerator$1.prototype._validateMapping =
  function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource,
                                              aName) {
    if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
        && aGenerated.line > 0 && aGenerated.column >= 0
        && !aOriginal && !aSource && !aName) {
      // Case 1.
      return;
    }
    else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
             && aOriginal && 'line' in aOriginal && 'column' in aOriginal
             && aGenerated.line > 0 && aGenerated.column >= 0
             && aOriginal.line > 0 && aOriginal.column >= 0
             && aSource) {
      // Cases 2 and 3.
      return;
    }
    else {
      throw new Error('Invalid mapping: ' + JSON.stringify({
        generated: aGenerated,
        source: aSource,
        original: aOriginal,
        name: aName
      }));
    }
  };

/**
 * Serialize the accumulated mappings in to the stream of base 64 VLQs
 * specified by the source map format.
 */
SourceMapGenerator$1.prototype._serializeMappings =
  function SourceMapGenerator_serializeMappings() {
    var this$1 = this;

    var previousGeneratedColumn = 0;
    var previousGeneratedLine = 1;
    var previousOriginalColumn = 0;
    var previousOriginalLine = 0;
    var previousName = 0;
    var previousSource = 0;
    var result = '';
    var next;
    var mapping;
    var nameIdx;
    var sourceIdx;

    var mappings = this._mappings.toArray();
    for (var i = 0, len = mappings.length; i < len; i++) {
      mapping = mappings[i];
      next = ''

      if (mapping.generatedLine !== previousGeneratedLine) {
        previousGeneratedColumn = 0;
        while (mapping.generatedLine !== previousGeneratedLine) {
          next += ';';
          previousGeneratedLine++;
        }
      }
      else {
        if (i > 0) {
          if (!__moduleExports$6.compareByGeneratedPositionsInflated(mapping, mappings[i - 1])) {
            continue;
          }
          next += ',';
        }
      }

      next += __moduleExports$4.encode(mapping.generatedColumn
                                 - previousGeneratedColumn);
      previousGeneratedColumn = mapping.generatedColumn;

      if (mapping.source != null) {
        sourceIdx = this$1._sources.indexOf(mapping.source);
        next += __moduleExports$4.encode(sourceIdx - previousSource);
        previousSource = sourceIdx;

        // lines are stored 0-based in SourceMap spec version 3
        next += __moduleExports$4.encode(mapping.originalLine - 1
                                   - previousOriginalLine);
        previousOriginalLine = mapping.originalLine - 1;

        next += __moduleExports$4.encode(mapping.originalColumn
                                   - previousOriginalColumn);
        previousOriginalColumn = mapping.originalColumn;

        if (mapping.name != null) {
          nameIdx = this$1._names.indexOf(mapping.name);
          next += __moduleExports$4.encode(nameIdx - previousName);
          previousName = nameIdx;
        }
      }

      result += next;
    }

    return result;
  };

SourceMapGenerator$1.prototype._generateSourcesContent =
  function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
    return aSources.map(function (source) {
      if (!this._sourcesContents) {
        return null;
      }
      if (aSourceRoot != null) {
        source = __moduleExports$6.relative(aSourceRoot, source);
      }
      var key = __moduleExports$6.toSetString(source);
      return Object.prototype.hasOwnProperty.call(this._sourcesContents, key)
        ? this._sourcesContents[key]
        : null;
    }, this);
  };

/**
 * Externalize the source map.
 */
SourceMapGenerator$1.prototype.toJSON =
  function SourceMapGenerator_toJSON() {
    var map = {
      version: this._version,
      sources: this._sources.toArray(),
      names: this._names.toArray(),
      mappings: this._serializeMappings()
    };
    if (this._file != null) {
      map.file = this._file;
    }
    if (this._sourceRoot != null) {
      map.sourceRoot = this._sourceRoot;
    }
    if (this._sourcesContents) {
      map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
    }

    return map;
  };

/**
 * Render the source map being generated to a string.
 */
SourceMapGenerator$1.prototype.toString =
  function SourceMapGenerator_toString() {
    return JSON.stringify(this.toJSON());
  };

var SourceMapGenerator_1 = SourceMapGenerator$1;

var __moduleExports$3 = {
	SourceMapGenerator: SourceMapGenerator_1
};

var __moduleExports$10 = createCommonjsModule(function (module, exports) {
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

exports.GREATEST_LOWER_BOUND = 1;
exports.LEAST_UPPER_BOUND = 2;

/**
 * Recursive implementation of binary search.
 *
 * @param aLow Indices here and lower do not contain the needle.
 * @param aHigh Indices here and higher do not contain the needle.
 * @param aNeedle The element being searched for.
 * @param aHaystack The non-empty array being searched.
 * @param aCompare Function which takes two elements and returns -1, 0, or 1.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 */
function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
  // This function terminates when one of the following is true:
  //
  //   1. We find the exact element we are looking for.
  //
  //   2. We did not find the exact element, but we can return the index of
  //      the next-closest element.
  //
  //   3. We did not find the exact element, and there is no next-closest
  //      element than the one we are searching for, so we return -1.
  var mid = Math.floor((aHigh - aLow) / 2) + aLow;
  var cmp = aCompare(aNeedle, aHaystack[mid], true);
  if (cmp === 0) {
    // Found the element we are looking for.
    return mid;
  }
  else if (cmp > 0) {
    // Our needle is greater than aHaystack[mid].
    if (aHigh - mid > 1) {
      // The element is in the upper half.
      return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
    }

    // The exact needle element was not found in this haystack. Determine if
    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return aHigh < aHaystack.length ? aHigh : -1;
    } else {
      return mid;
    }
  }
  else {
    // Our needle is less than aHaystack[mid].
    if (mid - aLow > 1) {
      // The element is in the lower half.
      return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
    }

    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return mid;
    } else {
      return aLow < 0 ? -1 : aLow;
    }
  }
}

/**
 * This is an implementation of binary search which will always try and return
 * the index of the closest element if there is no exact hit. This is because
 * mappings between original and generated line/col pairs are single points,
 * and there is an implicit region between each of them, so a miss just means
 * that you aren't on the very start of a region.
 *
 * @param aNeedle The element you are looking for.
 * @param aHaystack The array that is being searched.
 * @param aCompare A function which takes the needle and an element in the
 *     array and returns -1, 0, or 1 depending on whether the needle is less
 *     than, equal to, or greater than the element, respectively.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'binarySearch.GREATEST_LOWER_BOUND'.
 */
exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
  if (aHaystack.length === 0) {
    return -1;
  }

  var index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack,
                              aCompare, aBias || exports.GREATEST_LOWER_BOUND);
  if (index < 0) {
    return -1;
  }

  // We have found either the exact element, or the next-closest element than
  // the one we are searching for. However, there may be more than one such
  // element. Make sure we always return the smallest of these.
  while (index - 1 >= 0) {
    if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
      break;
    }
    --index;
  }

  return index;
};
});

var binarySearch_1 = __moduleExports$10.GREATEST_LOWER_BOUND;
var binarySearch_2 = __moduleExports$10.LEAST_UPPER_BOUND;
var binarySearch_3 = __moduleExports$10.search;

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

// It turns out that some (most?) JavaScript engines don't self-host
// `Array.prototype.sort`. This makes sense because C++ will likely remain
// faster than JS when doing raw CPU-intensive sorting. However, when using a
// custom comparator function, calling back and forth between the VM's C++ and
// JIT'd JS is rather slow *and* loses JIT type information, resulting in
// worse generated code for the comparator function than would be optimal. In
// fact, when sorting with a comparator, these costs outweigh the benefits of
// sorting in C++. By using our own JS-implemented Quick Sort (below), we get
// a ~3500ms mean speed-up in `bench/bench.html`.

/**
 * Swap the elements indexed by `x` and `y` in the array `ary`.
 *
 * @param {Array} ary
 *        The array.
 * @param {Number} x
 *        The index of the first item.
 * @param {Number} y
 *        The index of the second item.
 */
function swap(ary, x, y) {
  var temp = ary[x];
  ary[x] = ary[y];
  ary[y] = temp;
}

/**
 * Returns a random integer within the range `low .. high` inclusive.
 *
 * @param {Number} low
 *        The lower bound on the range.
 * @param {Number} high
 *        The upper bound on the range.
 */
function randomIntInRange(low, high) {
  return Math.round(low + (Math.random() * (high - low)));
}

/**
 * The Quick Sort algorithm.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 * @param {Number} p
 *        Start index of the array
 * @param {Number} r
 *        End index of the array
 */
function doQuickSort(ary, comparator, p, r) {
  // If our lower bound is less than our upper bound, we (1) partition the
  // array into two pieces and (2) recurse on each half. If it is not, this is
  // the empty array and our base case.

  if (p < r) {
    // (1) Partitioning.
    //
    // The partitioning chooses a pivot between `p` and `r` and moves all
    // elements that are less than or equal to the pivot to the before it, and
    // all the elements that are greater than it after it. The effect is that
    // once partition is done, the pivot is in the exact place it will be when
    // the array is put in sorted order, and it will not need to be moved
    // again. This runs in O(n) time.

    // Always choose a random pivot so that an input array which is reverse
    // sorted does not cause O(n^2) running time.
    var pivotIndex = randomIntInRange(p, r);
    var i = p - 1;

    swap(ary, pivotIndex, r);
    var pivot = ary[r];

    // Immediately after `j` is incremented in this loop, the following hold
    // true:
    //
    //   * Every element in `ary[p .. i]` is less than or equal to the pivot.
    //
    //   * Every element in `ary[i+1 .. j-1]` is greater than the pivot.
    for (var j = p; j < r; j++) {
      if (comparator(ary[j], pivot) <= 0) {
        i += 1;
        swap(ary, i, j);
      }
    }

    swap(ary, i + 1, j);
    var q = i + 1;

    // (2) Recurse on each half.

    doQuickSort(ary, comparator, p, q - 1);
    doQuickSort(ary, comparator, q + 1, r);
  }
}

/**
 * Sort the given array in-place with the given comparator function.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 */
var quickSort_1 = function (ary, comparator) {
  doQuickSort(ary, comparator, 0, ary.length - 1);
};

var __moduleExports$11 = {
	quickSort: quickSort_1
};

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */



var ArraySet$2 = __moduleExports$7.ArraySet;

var quickSort = __moduleExports$11.quickSort;

function SourceMapConsumer$2(aSourceMap) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
  }

  return sourceMap.sections != null
    ? new IndexedSourceMapConsumer(sourceMap)
    : new BasicSourceMapConsumer(sourceMap);
}

SourceMapConsumer$2.fromSourceMap = function(aSourceMap) {
  return BasicSourceMapConsumer.fromSourceMap(aSourceMap);
}

/**
 * The version of the source mapping spec that we are consuming.
 */
SourceMapConsumer$2.prototype._version = 3;

// `__generatedMappings` and `__originalMappings` are arrays that hold the
// parsed mapping coordinates from the source map's "mappings" attribute. They
// are lazily instantiated, accessed via the `_generatedMappings` and
// `_originalMappings` getters respectively, and we only parse the mappings
// and create these arrays once queried for a source location. We jump through
// these hoops because there can be many thousands of mappings, and parsing
// them is expensive, so we only want to do it if we must.
//
// Each object in the arrays is of the form:
//
//     {
//       generatedLine: The line number in the generated code,
//       generatedColumn: The column number in the generated code,
//       source: The path to the original source file that generated this
//               chunk of code,
//       originalLine: The line number in the original source that
//                     corresponds to this chunk of generated code,
//       originalColumn: The column number in the original source that
//                       corresponds to this chunk of generated code,
//       name: The name of the original symbol which generated this chunk of
//             code.
//     }
//
// All properties except for `generatedLine` and `generatedColumn` can be
// `null`.
//
// `_generatedMappings` is ordered by the generated positions.
//
// `_originalMappings` is ordered by the original positions.

SourceMapConsumer$2.prototype.__generatedMappings = null;
Object.defineProperty(SourceMapConsumer$2.prototype, '_generatedMappings', {
  get: function () {
    if (!this.__generatedMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__generatedMappings;
  }
});

SourceMapConsumer$2.prototype.__originalMappings = null;
Object.defineProperty(SourceMapConsumer$2.prototype, '_originalMappings', {
  get: function () {
    if (!this.__originalMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__originalMappings;
  }
});

SourceMapConsumer$2.prototype._charIsMappingSeparator =
  function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
    var c = aStr.charAt(index);
    return c === ";" || c === ",";
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
SourceMapConsumer$2.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    throw new Error("Subclasses must implement _parseMappings");
  };

SourceMapConsumer$2.GENERATED_ORDER = 1;
SourceMapConsumer$2.ORIGINAL_ORDER = 2;

SourceMapConsumer$2.GREATEST_LOWER_BOUND = 1;
SourceMapConsumer$2.LEAST_UPPER_BOUND = 2;

/**
 * Iterate over each mapping between an original source/line/column and a
 * generated line/column in this source map.
 *
 * @param Function aCallback
 *        The function that is called with each mapping.
 * @param Object aContext
 *        Optional. If specified, this object will be the value of `this` every
 *        time that `aCallback` is called.
 * @param aOrder
 *        Either `SourceMapConsumer.GENERATED_ORDER` or
 *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
 *        iterate over the mappings sorted by the generated file's line/column
 *        order or the original's source/line/column order, respectively. Defaults to
 *        `SourceMapConsumer.GENERATED_ORDER`.
 */
SourceMapConsumer$2.prototype.eachMapping =
  function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
    var context = aContext || null;
    var order = aOrder || SourceMapConsumer$2.GENERATED_ORDER;

    var mappings;
    switch (order) {
    case SourceMapConsumer$2.GENERATED_ORDER:
      mappings = this._generatedMappings;
      break;
    case SourceMapConsumer$2.ORIGINAL_ORDER:
      mappings = this._originalMappings;
      break;
    default:
      throw new Error("Unknown order of iteration.");
    }

    var sourceRoot = this.sourceRoot;
    mappings.map(function (mapping) {
      var source = mapping.source === null ? null : this._sources.at(mapping.source);
      if (source != null && sourceRoot != null) {
        source = __moduleExports$6.join(sourceRoot, source);
      }
      return {
        source: source,
        generatedLine: mapping.generatedLine,
        generatedColumn: mapping.generatedColumn,
        originalLine: mapping.originalLine,
        originalColumn: mapping.originalColumn,
        name: mapping.name === null ? null : this._names.at(mapping.name)
      };
    }, this).forEach(aCallback, context);
  };

/**
 * Returns all generated line and column information for the original source,
 * line, and column provided. If no column is provided, returns all mappings
 * corresponding to a either the line we are searching for or the next
 * closest line that has any mappings. Otherwise, returns all mappings
 * corresponding to the given line and either the column we are searching for
 * or the next closest column that has any offsets.
 *
 * The only argument is an object with the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.
 *   - column: Optional. the column number in the original source.
 *
 * and an array of objects is returned, each with the following properties:
 *
 *   - line: The line number in the generated source, or null.
 *   - column: The column number in the generated source, or null.
 */
SourceMapConsumer$2.prototype.allGeneratedPositionsFor =
  function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
    var this$1 = this;

    var line = __moduleExports$6.getArg(aArgs, 'line');

    // When there is no exact match, BasicSourceMapConsumer.prototype._findMapping
    // returns the index of the closest mapping less than the needle. By
    // setting needle.originalColumn to 0, we thus find the last mapping for
    // the given line, provided such a mapping exists.
    var needle = {
      source: __moduleExports$6.getArg(aArgs, 'source'),
      originalLine: line,
      originalColumn: __moduleExports$6.getArg(aArgs, 'column', 0)
    };

    if (this.sourceRoot != null) {
      needle.source = __moduleExports$6.relative(this.sourceRoot, needle.source);
    }
    if (!this._sources.has(needle.source)) {
      return [];
    }
    needle.source = this._sources.indexOf(needle.source);

    var mappings = [];

    var index = this._findMapping(needle,
                                  this._originalMappings,
                                  "originalLine",
                                  "originalColumn",
                                  __moduleExports$6.compareByOriginalPositions,
                                  __moduleExports$10.LEAST_UPPER_BOUND);
    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (aArgs.column === undefined) {
        var originalLine = mapping.originalLine;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we found. Since
        // mappings are sorted, this is guaranteed to find all mappings for
        // the line we found.
        while (mapping && mapping.originalLine === originalLine) {
          mappings.push({
            line: __moduleExports$6.getArg(mapping, 'generatedLine', null),
            column: __moduleExports$6.getArg(mapping, 'generatedColumn', null),
            lastColumn: __moduleExports$6.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this$1._originalMappings[++index];
        }
      } else {
        var originalColumn = mapping.originalColumn;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we were searching for.
        // Since mappings are sorted, this is guaranteed to find all mappings for
        // the line we are searching for.
        while (mapping &&
               mapping.originalLine === line &&
               mapping.originalColumn == originalColumn) {
          mappings.push({
            line: __moduleExports$6.getArg(mapping, 'generatedLine', null),
            column: __moduleExports$6.getArg(mapping, 'generatedColumn', null),
            lastColumn: __moduleExports$6.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this$1._originalMappings[++index];
        }
      }
    }

    return mappings;
  };

var SourceMapConsumer_1 = SourceMapConsumer$2;

/**
 * A BasicSourceMapConsumer instance represents a parsed source map which we can
 * query for information about the original file positions by giving it a file
 * position in the generated source.
 *
 * The only parameter is the raw source map (either as a JSON string, or
 * already parsed to an object). According to the spec, source maps have the
 * following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - sources: An array of URLs to the original source files.
 *   - names: An array of identifiers which can be referrenced by individual mappings.
 *   - sourceRoot: Optional. The URL root from which all sources are relative.
 *   - sourcesContent: Optional. An array of contents of the original source files.
 *   - mappings: A string of base64 VLQs which contain the actual mappings.
 *   - file: Optional. The generated file this source map is associated with.
 *
 * Here is an example source map, taken from the source map spec[0]:
 *
 *     {
 *       version : 3,
 *       file: "out.js",
 *       sourceRoot : "",
 *       sources: ["foo.js", "bar.js"],
 *       names: ["src", "maps", "are", "fun"],
 *       mappings: "AA,AB;;ABCDE;"
 *     }
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
 */
function BasicSourceMapConsumer(aSourceMap) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
  }

  var version = __moduleExports$6.getArg(sourceMap, 'version');
  var sources = __moduleExports$6.getArg(sourceMap, 'sources');
  // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
  // requires the array) to play nice here.
  var names = __moduleExports$6.getArg(sourceMap, 'names', []);
  var sourceRoot = __moduleExports$6.getArg(sourceMap, 'sourceRoot', null);
  var sourcesContent = __moduleExports$6.getArg(sourceMap, 'sourcesContent', null);
  var mappings = __moduleExports$6.getArg(sourceMap, 'mappings');
  var file = __moduleExports$6.getArg(sourceMap, 'file', null);

  // Once again, Sass deviates from the spec and supplies the version as a
  // string rather than a number, so we use loose equality checking here.
  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  sources = sources
    .map(String)
    // Some source maps produce relative source paths like "./foo.js" instead of
    // "foo.js".  Normalize these first so that future comparisons will succeed.
    // See bugzil.la/1090768.
    .map(__moduleExports$6.normalize)
    // Always ensure that absolute sources are internally stored relative to
    // the source root, if the source root is absolute. Not doing this would
    // be particularly problematic when the source root is a prefix of the
    // source (valid, but why??). See github issue #199 and bugzil.la/1188982.
    .map(function (source) {
      return sourceRoot && __moduleExports$6.isAbsolute(sourceRoot) && __moduleExports$6.isAbsolute(source)
        ? __moduleExports$6.relative(sourceRoot, source)
        : source;
    });

  // Pass `true` below to allow duplicate names and sources. While source maps
  // are intended to be compressed and deduplicated, the TypeScript compiler
  // sometimes generates source maps with duplicates in them. See Github issue
  // #72 and bugzil.la/889492.
  this._names = ArraySet$2.fromArray(names.map(String), true);
  this._sources = ArraySet$2.fromArray(sources, true);

  this.sourceRoot = sourceRoot;
  this.sourcesContent = sourcesContent;
  this._mappings = mappings;
  this.file = file;
}

BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer$2.prototype);
BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer$2;

/**
 * Create a BasicSourceMapConsumer from a SourceMapGenerator.
 *
 * @param SourceMapGenerator aSourceMap
 *        The source map that will be consumed.
 * @returns BasicSourceMapConsumer
 */
BasicSourceMapConsumer.fromSourceMap =
  function SourceMapConsumer_fromSourceMap(aSourceMap) {
    var smc = Object.create(BasicSourceMapConsumer.prototype);

    var names = smc._names = ArraySet$2.fromArray(aSourceMap._names.toArray(), true);
    var sources = smc._sources = ArraySet$2.fromArray(aSourceMap._sources.toArray(), true);
    smc.sourceRoot = aSourceMap._sourceRoot;
    smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
                                                            smc.sourceRoot);
    smc.file = aSourceMap._file;

    // Because we are modifying the entries (by converting string sources and
    // names to indices into the sources and names ArraySets), we have to make
    // a copy of the entry or else bad things happen. Shared mutable state
    // strikes again! See github issue #191.

    var generatedMappings = aSourceMap._mappings.toArray().slice();
    var destGeneratedMappings = smc.__generatedMappings = [];
    var destOriginalMappings = smc.__originalMappings = [];

    for (var i = 0, length = generatedMappings.length; i < length; i++) {
      var srcMapping = generatedMappings[i];
      var destMapping = new Mapping;
      destMapping.generatedLine = srcMapping.generatedLine;
      destMapping.generatedColumn = srcMapping.generatedColumn;

      if (srcMapping.source) {
        destMapping.source = sources.indexOf(srcMapping.source);
        destMapping.originalLine = srcMapping.originalLine;
        destMapping.originalColumn = srcMapping.originalColumn;

        if (srcMapping.name) {
          destMapping.name = names.indexOf(srcMapping.name);
        }

        destOriginalMappings.push(destMapping);
      }

      destGeneratedMappings.push(destMapping);
    }

    quickSort(smc.__originalMappings, __moduleExports$6.compareByOriginalPositions);

    return smc;
  };

/**
 * The version of the source mapping spec that we are consuming.
 */
BasicSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(BasicSourceMapConsumer.prototype, 'sources', {
  get: function () {
    return this._sources.toArray().map(function (s) {
      return this.sourceRoot != null ? __moduleExports$6.join(this.sourceRoot, s) : s;
    }, this);
  }
});

/**
 * Provide the JIT with a nice shape / hidden class.
 */
function Mapping() {
  this.generatedLine = 0;
  this.generatedColumn = 0;
  this.source = null;
  this.originalLine = null;
  this.originalColumn = null;
  this.name = null;
}

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
BasicSourceMapConsumer.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    var this$1 = this;

    var generatedLine = 1;
    var previousGeneratedColumn = 0;
    var previousOriginalLine = 0;
    var previousOriginalColumn = 0;
    var previousSource = 0;
    var previousName = 0;
    var length = aStr.length;
    var index = 0;
    var cachedSegments = {};
    var temp = {};
    var originalMappings = [];
    var generatedMappings = [];
    var mapping, str, segment, end, value;

    while (index < length) {
      if (aStr.charAt(index) === ';') {
        generatedLine++;
        index++;
        previousGeneratedColumn = 0;
      }
      else if (aStr.charAt(index) === ',') {
        index++;
      }
      else {
        mapping = new Mapping();
        mapping.generatedLine = generatedLine;

        // Because each offset is encoded relative to the previous one,
        // many segments often have the same encoding. We can exploit this
        // fact by caching the parsed variable length fields of each segment,
        // allowing us to avoid a second parse if we encounter the same
        // segment again.
        for (end = index; end < length; end++) {
          if (this$1._charIsMappingSeparator(aStr, end)) {
            break;
          }
        }
        str = aStr.slice(index, end);

        segment = cachedSegments[str];
        if (segment) {
          index += str.length;
        } else {
          segment = [];
          while (index < end) {
            __moduleExports$4.decode(aStr, index, temp);
            value = temp.value;
            index = temp.rest;
            segment.push(value);
          }

          if (segment.length === 2) {
            throw new Error('Found a source, but no line and column');
          }

          if (segment.length === 3) {
            throw new Error('Found a source and line, but no column');
          }

          cachedSegments[str] = segment;
        }

        // Generated column.
        mapping.generatedColumn = previousGeneratedColumn + segment[0];
        previousGeneratedColumn = mapping.generatedColumn;

        if (segment.length > 1) {
          // Original source.
          mapping.source = previousSource + segment[1];
          previousSource += segment[1];

          // Original line.
          mapping.originalLine = previousOriginalLine + segment[2];
          previousOriginalLine = mapping.originalLine;
          // Lines are stored 0-based
          mapping.originalLine += 1;

          // Original column.
          mapping.originalColumn = previousOriginalColumn + segment[3];
          previousOriginalColumn = mapping.originalColumn;

          if (segment.length > 4) {
            // Original name.
            mapping.name = previousName + segment[4];
            previousName += segment[4];
          }
        }

        generatedMappings.push(mapping);
        if (typeof mapping.originalLine === 'number') {
          originalMappings.push(mapping);
        }
      }
    }

    quickSort(generatedMappings, __moduleExports$6.compareByGeneratedPositionsDeflated);
    this.__generatedMappings = generatedMappings;

    quickSort(originalMappings, __moduleExports$6.compareByOriginalPositions);
    this.__originalMappings = originalMappings;
  };

/**
 * Find the mapping that best matches the hypothetical "needle" mapping that
 * we are searching for in the given "haystack" of mappings.
 */
BasicSourceMapConsumer.prototype._findMapping =
  function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
                                         aColumnName, aComparator, aBias) {
    // To return the position we are searching for, we must first find the
    // mapping for the given position and then return the opposite position it
    // points to. Because the mappings are sorted, we can use binary search to
    // find the best mapping.

    if (aNeedle[aLineName] <= 0) {
      throw new TypeError('Line must be greater than or equal to 1, got '
                          + aNeedle[aLineName]);
    }
    if (aNeedle[aColumnName] < 0) {
      throw new TypeError('Column must be greater than or equal to 0, got '
                          + aNeedle[aColumnName]);
    }

    return __moduleExports$10.search(aNeedle, aMappings, aComparator, aBias);
  };

/**
 * Compute the last column for each generated mapping. The last column is
 * inclusive.
 */
BasicSourceMapConsumer.prototype.computeColumnSpans =
  function SourceMapConsumer_computeColumnSpans() {
    var this$1 = this;

    for (var index = 0; index < this._generatedMappings.length; ++index) {
      var mapping = this$1._generatedMappings[index];

      // Mappings do not contain a field for the last generated columnt. We
      // can come up with an optimistic estimate, however, by assuming that
      // mappings are contiguous (i.e. given two consecutive mappings, the
      // first mapping ends where the second one starts).
      if (index + 1 < this$1._generatedMappings.length) {
        var nextMapping = this$1._generatedMappings[index + 1];

        if (mapping.generatedLine === nextMapping.generatedLine) {
          mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
          continue;
        }
      }

      // The last mapping for each line spans the entire line.
      mapping.lastGeneratedColumn = Infinity;
    }
  };

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.
 *   - column: The column number in the generated source.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.
 *   - column: The column number in the original source, or null.
 *   - name: The original identifier, or null.
 */
BasicSourceMapConsumer.prototype.originalPositionFor =
  function SourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: __moduleExports$6.getArg(aArgs, 'line'),
      generatedColumn: __moduleExports$6.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._generatedMappings,
      "generatedLine",
      "generatedColumn",
      __moduleExports$6.compareByGeneratedPositionsDeflated,
      __moduleExports$6.getArg(aArgs, 'bias', SourceMapConsumer$2.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._generatedMappings[index];

      if (mapping.generatedLine === needle.generatedLine) {
        var source = __moduleExports$6.getArg(mapping, 'source', null);
        if (source !== null) {
          source = this._sources.at(source);
          if (this.sourceRoot != null) {
            source = __moduleExports$6.join(this.sourceRoot, source);
          }
        }
        var name = __moduleExports$6.getArg(mapping, 'name', null);
        if (name !== null) {
          name = this._names.at(name);
        }
        return {
          source: source,
          line: __moduleExports$6.getArg(mapping, 'originalLine', null),
          column: __moduleExports$6.getArg(mapping, 'originalColumn', null),
          name: name
        };
      }
    }

    return {
      source: null,
      line: null,
      column: null,
      name: null
    };
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
BasicSourceMapConsumer.prototype.hasContentsOfAllSources =
  function BasicSourceMapConsumer_hasContentsOfAllSources() {
    if (!this.sourcesContent) {
      return false;
    }
    return this.sourcesContent.length >= this._sources.size() &&
      !this.sourcesContent.some(function (sc) { return sc == null; });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
BasicSourceMapConsumer.prototype.sourceContentFor =
  function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    if (!this.sourcesContent) {
      return null;
    }

    if (this.sourceRoot != null) {
      aSource = __moduleExports$6.relative(this.sourceRoot, aSource);
    }

    if (this._sources.has(aSource)) {
      return this.sourcesContent[this._sources.indexOf(aSource)];
    }

    var url;
    if (this.sourceRoot != null
        && (url = __moduleExports$6.urlParse(this.sourceRoot))) {
      // XXX: file:// URIs and absolute paths lead to unexpected behavior for
      // many users. We can help them out when they expect file:// URIs to
      // behave like it would if they were running a local HTTP server. See
      // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
      var fileUriAbsPath = aSource.replace(/^file:\/\//, "");
      if (url.scheme == "file"
          && this._sources.has(fileUriAbsPath)) {
        return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
      }

      if ((!url.path || url.path == "/")
          && this._sources.has("/" + aSource)) {
        return this.sourcesContent[this._sources.indexOf("/" + aSource)];
      }
    }

    // This function is used recursively from
    // IndexedSourceMapConsumer.prototype.sourceContentFor. In that case, we
    // don't want to throw if we can't find the source - we just want to
    // return null, so we provide a flag to exit gracefully.
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + aSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.
 *   - column: The column number in the original source.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.
 *   - column: The column number in the generated source, or null.
 */
BasicSourceMapConsumer.prototype.generatedPositionFor =
  function SourceMapConsumer_generatedPositionFor(aArgs) {
    var source = __moduleExports$6.getArg(aArgs, 'source');
    if (this.sourceRoot != null) {
      source = __moduleExports$6.relative(this.sourceRoot, source);
    }
    if (!this._sources.has(source)) {
      return {
        line: null,
        column: null,
        lastColumn: null
      };
    }
    source = this._sources.indexOf(source);

    var needle = {
      source: source,
      originalLine: __moduleExports$6.getArg(aArgs, 'line'),
      originalColumn: __moduleExports$6.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._originalMappings,
      "originalLine",
      "originalColumn",
      __moduleExports$6.compareByOriginalPositions,
      __moduleExports$6.getArg(aArgs, 'bias', SourceMapConsumer$2.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (mapping.source === needle.source) {
        return {
          line: __moduleExports$6.getArg(mapping, 'generatedLine', null),
          column: __moduleExports$6.getArg(mapping, 'generatedColumn', null),
          lastColumn: __moduleExports$6.getArg(mapping, 'lastGeneratedColumn', null)
        };
      }
    }

    return {
      line: null,
      column: null,
      lastColumn: null
    };
  };

var BasicSourceMapConsumer_1 = BasicSourceMapConsumer;

/**
 * An IndexedSourceMapConsumer instance represents a parsed source map which
 * we can query for information. It differs from BasicSourceMapConsumer in
 * that it takes "indexed" source maps (i.e. ones with a "sections" field) as
 * input.
 *
 * The only parameter is a raw source map (either as a JSON string, or already
 * parsed to an object). According to the spec for indexed source maps, they
 * have the following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - file: Optional. The generated file this source map is associated with.
 *   - sections: A list of section definitions.
 *
 * Each value under the "sections" field has two fields:
 *   - offset: The offset into the original specified at which this section
 *       begins to apply, defined as an object with a "line" and "column"
 *       field.
 *   - map: A source map definition. This source map could also be indexed,
 *       but doesn't have to be.
 *
 * Instead of the "map" field, it's also possible to have a "url" field
 * specifying a URL to retrieve a source map from, but that's currently
 * unsupported.
 *
 * Here's an example source map, taken from the source map spec[0], but
 * modified to omit a section which uses the "url" field.
 *
 *  {
 *    version : 3,
 *    file: "app.js",
 *    sections: [{
 *      offset: {line:100, column:10},
 *      map: {
 *        version : 3,
 *        file: "section.js",
 *        sources: ["foo.js", "bar.js"],
 *        names: ["src", "maps", "are", "fun"],
 *        mappings: "AAAA,E;;ABCDE;"
 *      }
 *    }],
 *  }
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.535es3xeprgt
 */
function IndexedSourceMapConsumer(aSourceMap) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
  }

  var version = __moduleExports$6.getArg(sourceMap, 'version');
  var sections = __moduleExports$6.getArg(sourceMap, 'sections');

  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  this._sources = new ArraySet$2();
  this._names = new ArraySet$2();

  var lastOffset = {
    line: -1,
    column: 0
  };
  this._sections = sections.map(function (s) {
    if (s.url) {
      // The url field will require support for asynchronicity.
      // See https://github.com/mozilla/source-map/issues/16
      throw new Error('Support for url field in sections not implemented.');
    }
    var offset = __moduleExports$6.getArg(s, 'offset');
    var offsetLine = __moduleExports$6.getArg(offset, 'line');
    var offsetColumn = __moduleExports$6.getArg(offset, 'column');

    if (offsetLine < lastOffset.line ||
        (offsetLine === lastOffset.line && offsetColumn < lastOffset.column)) {
      throw new Error('Section offsets must be ordered and non-overlapping.');
    }
    lastOffset = offset;

    return {
      generatedOffset: {
        // The offset fields are 0-based, but we use 1-based indices when
        // encoding/decoding from VLQ.
        generatedLine: offsetLine + 1,
        generatedColumn: offsetColumn + 1
      },
      consumer: new SourceMapConsumer$2(__moduleExports$6.getArg(s, 'map'))
    }
  });
}

IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer$2.prototype);
IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer$2;

/**
 * The version of the source mapping spec that we are consuming.
 */
IndexedSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(IndexedSourceMapConsumer.prototype, 'sources', {
  get: function () {
    var this$1 = this;

    var sources = [];
    for (var i = 0; i < this._sections.length; i++) {
      for (var j = 0; j < this._sections[i].consumer.sources.length; j++) {
        sources.push(this$1._sections[i].consumer.sources[j]);
      }
    }
    return sources;
  }
});

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.
 *   - column: The column number in the generated source.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.
 *   - column: The column number in the original source, or null.
 *   - name: The original identifier, or null.
 */
IndexedSourceMapConsumer.prototype.originalPositionFor =
  function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: __moduleExports$6.getArg(aArgs, 'line'),
      generatedColumn: __moduleExports$6.getArg(aArgs, 'column')
    };

    // Find the section containing the generated position we're trying to map
    // to an original position.
    var sectionIndex = __moduleExports$10.search(needle, this._sections,
      function(needle, section) {
        var cmp = needle.generatedLine - section.generatedOffset.generatedLine;
        if (cmp) {
          return cmp;
        }

        return (needle.generatedColumn -
                section.generatedOffset.generatedColumn);
      });
    var section = this._sections[sectionIndex];

    if (!section) {
      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    }

    return section.consumer.originalPositionFor({
      line: needle.generatedLine -
        (section.generatedOffset.generatedLine - 1),
      column: needle.generatedColumn -
        (section.generatedOffset.generatedLine === needle.generatedLine
         ? section.generatedOffset.generatedColumn - 1
         : 0),
      bias: aArgs.bias
    });
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
IndexedSourceMapConsumer.prototype.hasContentsOfAllSources =
  function IndexedSourceMapConsumer_hasContentsOfAllSources() {
    return this._sections.every(function (s) {
      return s.consumer.hasContentsOfAllSources();
    });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
IndexedSourceMapConsumer.prototype.sourceContentFor =
  function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    var this$1 = this;

    for (var i = 0; i < this._sections.length; i++) {
      var section = this$1._sections[i];

      var content = section.consumer.sourceContentFor(aSource, true);
      if (content) {
        return content;
      }
    }
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + aSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.
 *   - column: The column number in the original source.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.
 *   - column: The column number in the generated source, or null.
 */
IndexedSourceMapConsumer.prototype.generatedPositionFor =
  function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
    var this$1 = this;

    for (var i = 0; i < this._sections.length; i++) {
      var section = this$1._sections[i];

      // Only consider this section if the requested source is in the list of
      // sources of the consumer.
      if (section.consumer.sources.indexOf(__moduleExports$6.getArg(aArgs, 'source')) === -1) {
        continue;
      }
      var generatedPosition = section.consumer.generatedPositionFor(aArgs);
      if (generatedPosition) {
        var ret = {
          line: generatedPosition.line +
            (section.generatedOffset.generatedLine - 1),
          column: generatedPosition.column +
            (section.generatedOffset.generatedLine === generatedPosition.line
             ? section.generatedOffset.generatedColumn - 1
             : 0)
        };
        return ret;
      }
    }

    return {
      line: null,
      column: null
    };
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
IndexedSourceMapConsumer.prototype._parseMappings =
  function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    var this$1 = this;

    this.__generatedMappings = [];
    this.__originalMappings = [];
    for (var i = 0; i < this._sections.length; i++) {
      var section = this$1._sections[i];
      var sectionMappings = section.consumer._generatedMappings;
      for (var j = 0; j < sectionMappings.length; j++) {
        var mapping = sectionMappings[j];

        var source = section.consumer._sources.at(mapping.source);
        if (section.consumer.sourceRoot !== null) {
          source = __moduleExports$6.join(section.consumer.sourceRoot, source);
        }
        this$1._sources.add(source);
        source = this$1._sources.indexOf(source);

        var name = section.consumer._names.at(mapping.name);
        this$1._names.add(name);
        name = this$1._names.indexOf(name);

        // The mappings coming from the consumer for the section have
        // generated positions relative to the start of the section, so we
        // need to offset them to be relative to the start of the concatenated
        // generated file.
        var adjustedMapping = {
          source: source,
          generatedLine: mapping.generatedLine +
            (section.generatedOffset.generatedLine - 1),
          generatedColumn: mapping.generatedColumn +
            (section.generatedOffset.generatedLine === mapping.generatedLine
            ? section.generatedOffset.generatedColumn - 1
            : 0),
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name: name
        };

        this$1.__generatedMappings.push(adjustedMapping);
        if (typeof adjustedMapping.originalLine === 'number') {
          this$1.__originalMappings.push(adjustedMapping);
        }
      }
    }

    quickSort(this.__generatedMappings, __moduleExports$6.compareByGeneratedPositionsDeflated);
    quickSort(this.__originalMappings, __moduleExports$6.compareByOriginalPositions);
  };

var IndexedSourceMapConsumer_1 = IndexedSourceMapConsumer;

var __moduleExports$9 = {
	SourceMapConsumer: SourceMapConsumer_1,
	BasicSourceMapConsumer: BasicSourceMapConsumer_1,
	IndexedSourceMapConsumer: IndexedSourceMapConsumer_1
};

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var SourceMapGenerator$2 = __moduleExports$3.SourceMapGenerator;


// Matches a Windows-style `\r\n` newline or a `\n` newline used by all other
// operating systems these days (capturing the result).
var REGEX_NEWLINE = /(\r?\n)/;

// Newline character code for charCodeAt() comparisons
var NEWLINE_CODE = 10;

// Private symbol for identifying `SourceNode`s when multiple versions of
// the source-map library are loaded. This MUST NOT CHANGE across
// versions!
var isSourceNode = "$$$isSourceNode$$$";

/**
 * SourceNodes provide a way to abstract over interpolating/concatenating
 * snippets of generated JavaScript source code while maintaining the line and
 * column information associated with the original source code.
 *
 * @param aLine The original line number.
 * @param aColumn The original column number.
 * @param aSource The original source's filename.
 * @param aChunks Optional. An array of strings which are snippets of
 *        generated JS, or other SourceNodes.
 * @param aName The original identifier.
 */
function SourceNode$2(aLine, aColumn, aSource, aChunks, aName) {
  this.children = [];
  this.sourceContents = {};
  this.line = aLine == null ? null : aLine;
  this.column = aColumn == null ? null : aColumn;
  this.source = aSource == null ? null : aSource;
  this.name = aName == null ? null : aName;
  this[isSourceNode] = true;
  if (aChunks != null) { this.add(aChunks); }
}

/**
 * Creates a SourceNode from generated code and a SourceMapConsumer.
 *
 * @param aGeneratedCode The generated code
 * @param aSourceMapConsumer The SourceMap for the generated code
 * @param aRelativePath Optional. The path that relative sources in the
 *        SourceMapConsumer should be relative to.
 */
SourceNode$2.fromStringWithSourceMap =
  function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
    // The SourceNode we want to fill with the generated code
    // and the SourceMap
    var node = new SourceNode$2();

    // All even indices of this array are one line of the generated code,
    // while all odd indices are the newlines between two adjacent lines
    // (since `REGEX_NEWLINE` captures its match).
    // Processed fragments are removed from this array, by calling `shiftNextLine`.
    var remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
    var shiftNextLine = function() {
      var lineContents = remainingLines.shift();
      // The last line of a file might not have a newline.
      var newLine = remainingLines.shift() || "";
      return lineContents + newLine;
    };

    // We need to remember the position of "remainingLines"
    var lastGeneratedLine = 1, lastGeneratedColumn = 0;

    // The generate SourceNodes we need a code range.
    // To extract it current and last mapping is used.
    // Here we store the last mapping.
    var lastMapping = null;

    aSourceMapConsumer.eachMapping(function (mapping) {
      if (lastMapping !== null) {
        // We add the code from "lastMapping" to "mapping":
        // First check if there is a new line in between.
        if (lastGeneratedLine < mapping.generatedLine) {
          // Associate first line with "lastMapping"
          addMappingWithCode(lastMapping, shiftNextLine());
          lastGeneratedLine++;
          lastGeneratedColumn = 0;
          // The remaining code is added without mapping
        } else {
          // There is no new line in between.
          // Associate the code between "lastGeneratedColumn" and
          // "mapping.generatedColumn" with "lastMapping"
          var nextLine = remainingLines[0];
          var code = nextLine.substr(0, mapping.generatedColumn -
                                        lastGeneratedColumn);
          remainingLines[0] = nextLine.substr(mapping.generatedColumn -
                                              lastGeneratedColumn);
          lastGeneratedColumn = mapping.generatedColumn;
          addMappingWithCode(lastMapping, code);
          // No more remaining code, continue
          lastMapping = mapping;
          return;
        }
      }
      // We add the generated code until the first mapping
      // to the SourceNode without any mapping.
      // Each line is added as separate string.
      while (lastGeneratedLine < mapping.generatedLine) {
        node.add(shiftNextLine());
        lastGeneratedLine++;
      }
      if (lastGeneratedColumn < mapping.generatedColumn) {
        var nextLine = remainingLines[0];
        node.add(nextLine.substr(0, mapping.generatedColumn));
        remainingLines[0] = nextLine.substr(mapping.generatedColumn);
        lastGeneratedColumn = mapping.generatedColumn;
      }
      lastMapping = mapping;
    }, this);
    // We have processed all mappings.
    if (remainingLines.length > 0) {
      if (lastMapping) {
        // Associate the remaining code in the current line with "lastMapping"
        addMappingWithCode(lastMapping, shiftNextLine());
      }
      // and add the remaining lines without any mapping
      node.add(remainingLines.join(""));
    }

    // Copy sourcesContent into SourceNode
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        if (aRelativePath != null) {
          sourceFile = __moduleExports$6.join(aRelativePath, sourceFile);
        }
        node.setSourceContent(sourceFile, content);
      }
    });

    return node;

    function addMappingWithCode(mapping, code) {
      if (mapping === null || mapping.source === undefined) {
        node.add(code);
      } else {
        var source = aRelativePath
          ? __moduleExports$6.join(aRelativePath, mapping.source)
          : mapping.source;
        node.add(new SourceNode$2(mapping.originalLine,
                                mapping.originalColumn,
                                source,
                                code,
                                mapping.name));
      }
    }
  };

/**
 * Add a chunk of generated JS to this source node.
 *
 * @param aChunk A string snippet of generated JS code, another instance of
 *        SourceNode, or an array where each member is one of those things.
 */
SourceNode$2.prototype.add = function SourceNode_add(aChunk) {
  if (Array.isArray(aChunk)) {
    aChunk.forEach(function (chunk) {
      this.add(chunk);
    }, this);
  }
  else if (aChunk[isSourceNode] || typeof aChunk === "string") {
    if (aChunk) {
      this.children.push(aChunk);
    }
  }
  else {
    throw new TypeError(
      "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
    );
  }
  return this;
};

/**
 * Add a chunk of generated JS to the beginning of this source node.
 *
 * @param aChunk A string snippet of generated JS code, another instance of
 *        SourceNode, or an array where each member is one of those things.
 */
SourceNode$2.prototype.prepend = function SourceNode_prepend(aChunk) {
  var this$1 = this;

  if (Array.isArray(aChunk)) {
    for (var i = aChunk.length-1; i >= 0; i--) {
      this$1.prepend(aChunk[i]);
    }
  }
  else if (aChunk[isSourceNode] || typeof aChunk === "string") {
    this.children.unshift(aChunk);
  }
  else {
    throw new TypeError(
      "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
    );
  }
  return this;
};

/**
 * Walk over the tree of JS snippets in this node and its children. The
 * walking function is called once for each snippet of JS and is passed that
 * snippet and the its original associated source's line/column location.
 *
 * @param aFn The traversal function.
 */
SourceNode$2.prototype.walk = function SourceNode_walk(aFn) {
  var this$1 = this;

  var chunk;
  for (var i = 0, len = this.children.length; i < len; i++) {
    chunk = this$1.children[i];
    if (chunk[isSourceNode]) {
      chunk.walk(aFn);
    }
    else {
      if (chunk !== '') {
        aFn(chunk, { source: this$1.source,
                     line: this$1.line,
                     column: this$1.column,
                     name: this$1.name });
      }
    }
  }
};

/**
 * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
 * each of `this.children`.
 *
 * @param aSep The separator.
 */
SourceNode$2.prototype.join = function SourceNode_join(aSep) {
  var this$1 = this;

  var newChildren;
  var i;
  var len = this.children.length;
  if (len > 0) {
    newChildren = [];
    for (i = 0; i < len-1; i++) {
      newChildren.push(this$1.children[i]);
      newChildren.push(aSep);
    }
    newChildren.push(this.children[i]);
    this.children = newChildren;
  }
  return this;
};

/**
 * Call String.prototype.replace on the very right-most source snippet. Useful
 * for trimming whitespace from the end of a source node, etc.
 *
 * @param aPattern The pattern to replace.
 * @param aReplacement The thing to replace the pattern with.
 */
SourceNode$2.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
  var lastChild = this.children[this.children.length - 1];
  if (lastChild[isSourceNode]) {
    lastChild.replaceRight(aPattern, aReplacement);
  }
  else if (typeof lastChild === 'string') {
    this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
  }
  else {
    this.children.push(''.replace(aPattern, aReplacement));
  }
  return this;
};

/**
 * Set the source content for a source file. This will be added to the SourceMapGenerator
 * in the sourcesContent field.
 *
 * @param aSourceFile The filename of the source file
 * @param aSourceContent The content of the source file
 */
SourceNode$2.prototype.setSourceContent =
  function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
    this.sourceContents[__moduleExports$6.toSetString(aSourceFile)] = aSourceContent;
  };

/**
 * Walk over the tree of SourceNodes. The walking function is called for each
 * source file content and is passed the filename and source content.
 *
 * @param aFn The traversal function.
 */
SourceNode$2.prototype.walkSourceContents =
  function SourceNode_walkSourceContents(aFn) {
    var this$1 = this;

    for (var i = 0, len = this.children.length; i < len; i++) {
      if (this$1.children[i][isSourceNode]) {
        this$1.children[i].walkSourceContents(aFn);
      }
    }

    var sources = Object.keys(this.sourceContents);
    for (var i = 0, len = sources.length; i < len; i++) {
      aFn(__moduleExports$6.fromSetString(sources[i]), this$1.sourceContents[sources[i]]);
    }
  };

/**
 * Return the string representation of this source node. Walks over the tree
 * and concatenates all the various snippets together to one string.
 */
SourceNode$2.prototype.toString = function SourceNode_toString() {
  var str = "";
  this.walk(function (chunk) {
    str += chunk;
  });
  return str;
};

/**
 * Returns the string representation of this source node along with a source
 * map.
 */
SourceNode$2.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
  var generated = {
    code: "",
    line: 1,
    column: 0
  };
  var map = new SourceMapGenerator$2(aArgs);
  var sourceMappingActive = false;
  var lastOriginalSource = null;
  var lastOriginalLine = null;
  var lastOriginalColumn = null;
  var lastOriginalName = null;
  this.walk(function (chunk, original) {
    generated.code += chunk;
    if (original.source !== null
        && original.line !== null
        && original.column !== null) {
      if(lastOriginalSource !== original.source
         || lastOriginalLine !== original.line
         || lastOriginalColumn !== original.column
         || lastOriginalName !== original.name) {
        map.addMapping({
          source: original.source,
          original: {
            line: original.line,
            column: original.column
          },
          generated: {
            line: generated.line,
            column: generated.column
          },
          name: original.name
        });
      }
      lastOriginalSource = original.source;
      lastOriginalLine = original.line;
      lastOriginalColumn = original.column;
      lastOriginalName = original.name;
      sourceMappingActive = true;
    } else if (sourceMappingActive) {
      map.addMapping({
        generated: {
          line: generated.line,
          column: generated.column
        }
      });
      lastOriginalSource = null;
      sourceMappingActive = false;
    }
    for (var idx = 0, length = chunk.length; idx < length; idx++) {
      if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
        generated.line++;
        generated.column = 0;
        // Mappings end at eol
        if (idx + 1 === length) {
          lastOriginalSource = null;
          sourceMappingActive = false;
        } else if (sourceMappingActive) {
          map.addMapping({
            source: original.source,
            original: {
              line: original.line,
              column: original.column
            },
            generated: {
              line: generated.line,
              column: generated.column
            },
            name: original.name
          });
        }
      } else {
        generated.column++;
      }
    }
  });
  this.walkSourceContents(function (sourceFile, sourceContent) {
    map.setSourceContent(sourceFile, sourceContent);
  });

  return { code: generated.code, map: map };
};

var SourceNode_1 = SourceNode$2;

var __moduleExports$12 = {
	SourceNode: SourceNode_1
};

/*
 * Copyright 2009-2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
var SourceMapGenerator = __moduleExports$3.SourceMapGenerator;
var SourceMapConsumer$1 = __moduleExports$9.SourceMapConsumer;
var SourceNode$1 = __moduleExports$12.SourceNode;

var __moduleExports$2 = {
	SourceMapGenerator: SourceMapGenerator,
	SourceMapConsumer: SourceMapConsumer$1,
	SourceNode: SourceNode$1
};

var SourceNode = __moduleExports$2.SourceNode;
var SourceMapConsumer = __moduleExports$2.SourceMapConsumer;

var Source$1 = function Source () {};

Source$1.prototype.source = function source () {
	throw new Error("Abstract");
};

Source$1.prototype.size = function size () {
	return this.source().length;
};

Source$1.prototype.map = function map (options) {
	return null;
};

Source$1.prototype.sourceAndMap = function sourceAndMap (options) {
	return {
		source: this.source(),
		map: this.map()
	};
};

Source$1.prototype.node = function node () {
	throw new Error("Abstract");
};

Source$1.prototype.listNode = function listNode () {
	throw new Error("Abstract");
};

Source$1.prototype.updateHash = function updateHash (hash) {
	var source = this.source();
	hash.update(source || "");
};

var __moduleExports$1 = Source$1;

var getNumberOfLines$2 = function getNumberOfLines(str) {
	var nr = -1;
	var idx = -1;
	do {
		nr++
		idx = str.indexOf("\n", idx + 1);
	} while(idx >= 0);
	return nr;
};

var getUnfinishedLine$1 = function getUnfinishedLine(str) {
	var idx = str.lastIndexOf("\n");
	if(idx === -1)
		{ return str.length; }
	else
		{ return str.length - idx - 1; }
};

var __moduleExports$17 = {
	getNumberOfLines: getNumberOfLines$2,
	getUnfinishedLine: getUnfinishedLine$1
};

var getNumberOfLines$1 = __moduleExports$17.getNumberOfLines;
var getUnfinishedLine = __moduleExports$17.getUnfinishedLine;

var CodeNode$1 = function CodeNode(generatedCode) {
	this.generatedCode = generatedCode;
};

CodeNode$1.prototype.clone = function clone () {
	return new CodeNode$1(this.generatedCode);
};

CodeNode$1.prototype.getGeneratedCode = function getGeneratedCode () {
	return this.generatedCode;
};

CodeNode$1.prototype.getMappings = function getMappings (mappingsContext) {
	var lines = getNumberOfLines$1(this.generatedCode);
	var mapping = Array(lines+1).join(";");
	if(lines > 0) {
		mappingsContext.unfinishedGeneratedLine = getUnfinishedLine(this.generatedCode);
		if(mappingsContext.unfinishedGeneratedLine > 0) {
			return mapping + "A";
		} else {
			return mapping;
		}
	} else {
		var prevUnfinished = mappingsContext.unfinishedGeneratedLine;
		mappingsContext.unfinishedGeneratedLine += getUnfinishedLine(this.generatedCode);
		if(prevUnfinished === 0 && mappingsContext.unfinishedGeneratedLine > 0) {
			return "A";
		} else {
			return "";
		}
	}
};

CodeNode$1.prototype.addGeneratedCode = function addGeneratedCode (generatedCode) {
	this.generatedCode += generatedCode;
};

CodeNode$1.prototype.mapGeneratedCode = function mapGeneratedCode (fn) {
	var generatedCode = fn(this.generatedCode);
	return new CodeNode$1(generatedCode);
};

CodeNode$1.prototype.getNormalizedNodes = function getNormalizedNodes () {
	return [this];
};

CodeNode$1.prototype.merge = function merge (otherNode) {
	if(otherNode instanceof CodeNode$1) {
		this.generatedCode += otherNode.generatedCode;
		return this;
	}
	return false;
};

var __moduleExports$16 = CodeNode$1;

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on the Base 64 VLQ implementation in Closure Compiler:
 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
 *
 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of Google Inc. nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/*eslint no-bitwise:0,quotes:0,global-strict:0*/

var charToIntMap = {};
var intToCharMap$1 = {};

'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  .split('')
  .forEach(function (ch, index) {
    charToIntMap[ch] = index;
    intToCharMap$1[index] = ch;
  });

var base64 = {};
/**
 * Encode an integer in the range of 0 to 63 to a single base 64 digit.
 */
base64.encode = function base64_encode(aNumber) {
  if (aNumber in intToCharMap$1) {
    return intToCharMap$1[aNumber];
  }
  throw new TypeError("Must be between 0 and 63: " + aNumber);
};

/**
 * Decode a single base 64 digit to an integer.
 */
base64.decode = function base64_decode(aChar) {
  if (aChar in charToIntMap) {
    return charToIntMap[aChar];
  }
  throw new TypeError("Not a valid base 64 digit: " + aChar);
};



// A single base 64 digit can contain 6 bits of data. For the base 64 variable
// length quantities we use in the source map spec, the first bit is the sign,
// the next four bits are the actual value, and the 6th bit is the
// continuation bit. The continuation bit tells us whether there are more
// digits in this value following this digit.
//
//   Continuation
//   |    Sign
//   |    |
//   V    V
//   101011

var VLQ_BASE_SHIFT$1 = 5;

// binary: 100000
var VLQ_BASE$1 = 1 << VLQ_BASE_SHIFT$1;

// binary: 011111
var VLQ_BASE_MASK$1 = VLQ_BASE$1 - 1;

// binary: 100000
var VLQ_CONTINUATION_BIT$1 = VLQ_BASE$1;

/**
 * Converts from a two-complement value to a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
 *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
 */
function toVLQSigned$1(aValue) {
  return aValue < 0
    ? ((-aValue) << 1) + 1
    : (aValue << 1) + 0;
}

/**
 * Converts to a two-complement value from a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
 *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
 */
function fromVLQSigned$1(aValue) {
  var isNegative = (aValue & 1) === 1;
  var shifted = aValue >> 1;
  return isNegative
    ? -shifted
    : shifted;
}

/**
 * Returns the base 64 VLQ encoded value.
 */
var encode$2 = function base64VLQ_encode(aValue) {
  var encoded = "";
  var digit;

  var vlq = toVLQSigned$1(aValue);

  do {
    digit = vlq & VLQ_BASE_MASK$1;
    vlq >>>= VLQ_BASE_SHIFT$1;
    if (vlq > 0) {
      // There are still more digits in this value, so we must make sure the
      // continuation bit is marked.
      digit |= VLQ_CONTINUATION_BIT$1;
    }
    encoded += base64.encode(digit);
  } while (vlq > 0);

  return encoded;
};

/**
 * Decodes the next base 64 VLQ value from the given string and returns the
 * value and the rest of the string via the out parameter.
 */
var decode$2 = function base64VLQ_decode(aStr, aOutParam) {
  var i = 0;
  var strLen = aStr.length;
  var result = 0;
  var shift = 0;
  var continuation, digit;

  do {
    if (i >= strLen) {
      throw new Error("Expected more digits in base 64 VLQ value.");
    }
    digit = base64.decode(aStr.charAt(i++));
    continuation = !!(digit & VLQ_CONTINUATION_BIT$1);
    digit &= VLQ_BASE_MASK$1;
    result = result + (digit << shift);
    shift += VLQ_BASE_SHIFT$1;
  } while (continuation);

  aOutParam.value = fromVLQSigned$1(result);
  aOutParam.rest = aStr.slice(i);
};

var __moduleExports$19 = {
	encode: encode$2,
	decode: decode$2
};

var getNumberOfLines$4 = __moduleExports$17.getNumberOfLines;
var getUnfinishedLine$3 = __moduleExports$17.getUnfinishedLine;

var LINE_MAPPING$1 = ";AAAA";

var SingleLineNode$1 = function SingleLineNode(generatedCode, source, originalSource, line) {
	this.generatedCode = generatedCode;
	this.originalSource = originalSource;
	this.source = source;
	this.line = line || 1;
	this._numberOfLines = getNumberOfLines$4(this.generatedCode);
	this._endsWithNewLine = generatedCode[generatedCode.length - 1] === "\n";
};

SingleLineNode$1.prototype.clone = function clone () {
	return new SingleLineNode$1(this.generatedCode, this.source, this.originalSource, this.line);
};

SingleLineNode$1.prototype.getGeneratedCode = function getGeneratedCode () {
	return this.generatedCode;
};

SingleLineNode$1.prototype.getMappings = function getMappings (mappingsContext) {
	if(!this.generatedCode)
		{ return ""; }
	var lines = this._numberOfLines;
	var sourceIdx = mappingsContext.ensureSource(this.source, this.originalSource);
	var mappings = "A"; // generated column 0
	if(mappingsContext.unfinishedGeneratedLine)
		{ mappings = "," + __moduleExports$19.encode(mappingsContext.unfinishedGeneratedLine); }
	mappings += __moduleExports$19.encode(sourceIdx - mappingsContext.currentSource); // source index
	mappings += __moduleExports$19.encode(this.line - mappingsContext.currentOriginalLine); // original line index
	mappings += "A"; // original column 0
	mappingsContext.currentSource = sourceIdx;
	mappingsContext.currentOriginalLine = this.line;
	var unfinishedGeneratedLine = mappingsContext.unfinishedGeneratedLine = getUnfinishedLine$3(this.generatedCode)
	mappings += Array(lines).join(LINE_MAPPING$1);
	if(unfinishedGeneratedLine === 0) {
		mappings += ";";
	} else {
		if(lines !== 0)
			{ mappings += LINE_MAPPING$1; }
	}
	return mappings;
};

SingleLineNode$1.prototype.getNormalizedNodes = function getNormalizedNodes () {
	return [this];
};

SingleLineNode$1.prototype.mapGeneratedCode = function mapGeneratedCode (fn) {
	var generatedCode = fn(this.generatedCode);
	return new SingleLineNode$1(generatedCode, this.source, this.originalSource, this.line);
};

SingleLineNode$1.prototype.merge = function merge (otherNode) {
	if(otherNode instanceof SingleLineNode$1) {
		return this.mergeSingleLineNode(otherNode);
	}
	return false;
};

SingleLineNode$1.prototype.mergeSingleLineNode = function mergeSingleLineNode (otherNode) {
	if(this.source === otherNode.source &&
		this.originalSource === otherNode.originalSource) {
		if(this.line === otherNode.line) {
			this.generatedCode += otherNode.generatedCode;
			this._numberOfLines += otherNode._numberOfLines;
			this._endsWithNewLine = otherNode._endsWithNewLine;
			return this;
		} else if(this.line + 1 === otherNode.line && 
			this._endsWithNewLine &&
			this._numberOfLines === 1 && 
			otherNode._numberOfLines <= 1) {
			return new __moduleExports$18(this.generatedCode + otherNode.generatedCode, this.source, this.originalSource, this.line);
		}
	}
	return false;
};

var __moduleExports$20 = SingleLineNode$1;

var getNumberOfLines$3 = __moduleExports$17.getNumberOfLines;
var getUnfinishedLine$2 = __moduleExports$17.getUnfinishedLine;

var LINE_MAPPING = ";AACA";

var SourceNode$5 = function SourceNode(generatedCode, source, originalSource, startingLine) {
	this.generatedCode = generatedCode;
	this.originalSource = originalSource;
	this.source = source;
	this.startingLine = startingLine || 1;
	this._numberOfLines = getNumberOfLines$3(this.generatedCode);
	this._endsWithNewLine = generatedCode[generatedCode.length - 1] === "\n";
};

SourceNode$5.prototype.clone = function clone () {
	return new SourceNode$5(this.generatedCode, this.source, this.originalSource, this.startingLine);
};

SourceNode$5.prototype.getGeneratedCode = function getGeneratedCode () {
	return this.generatedCode;
};

SourceNode$5.prototype.addGeneratedCode = function addGeneratedCode (code) {
	this.generatedCode += code;
	this._numberOfLines += getNumberOfLines$3(code);
	this._endsWithNewLine = code[code.length - 1] === "\n";
};

SourceNode$5.prototype.getMappings = function getMappings (mappingsContext) {
	if(!this.generatedCode)
		{ return ""; }
	var lines = this._numberOfLines;
	var sourceIdx = mappingsContext.ensureSource(this.source, this.originalSource);
	var mappings = "A"; // generated column 0
	if(mappingsContext.unfinishedGeneratedLine)
		{ mappings = "," + __moduleExports$19.encode(mappingsContext.unfinishedGeneratedLine); }
	mappings += __moduleExports$19.encode(sourceIdx - mappingsContext.currentSource); // source index
	mappings += __moduleExports$19.encode(this.startingLine - mappingsContext.currentOriginalLine); // original line index
	mappings += "A"; // original column 0
	mappingsContext.currentSource = sourceIdx;
	mappingsContext.currentOriginalLine = this.startingLine + lines - 1;
	var unfinishedGeneratedLine = mappingsContext.unfinishedGeneratedLine = getUnfinishedLine$2(this.generatedCode)
	mappings += Array(lines).join(LINE_MAPPING);
	if(unfinishedGeneratedLine === 0) {
		mappings += ";";
	} else {
		if(lines !== 0) {
			mappings += LINE_MAPPING;
		}
		mappingsContext.currentOriginalLine++;
	}
	return mappings;
};

SourceNode$5.prototype.mapGeneratedCode = function mapGeneratedCode (fn) {
	throw new Error("Cannot map generated code on a SourceMap. Normalize to SingleLineNode first.");
};

SourceNode$5.prototype.getNormalizedNodes = function getNormalizedNodes () {
		var this$1 = this;

	var results = [];
	var currentLine = this.startingLine;
	var generatedCode = this.generatedCode;
	var index = 0;
	var indexEnd = generatedCode.length;
	while(index < indexEnd) {
		// get one generated line
		var nextLine = generatedCode.indexOf("\n", index) + 1;
		if(nextLine === 0) { nextLine = indexEnd; }
		var lineGenerated = generatedCode.substr(index, nextLine - index);

		results.push(new __moduleExports$20(lineGenerated, this$1.source, this$1.originalSource, currentLine));

		// move cursors
		index = nextLine;
		currentLine++;
	}
	return results;
};

SourceNode$5.prototype.merge = function merge (otherNode) {
	if(otherNode instanceof SourceNode$5) {
		return this.mergeSourceNode(otherNode);
	} else if(otherNode instanceof __moduleExports$20) {
		return this.mergeSingleLineNode(otherNode);
	}
	return false;
};

SourceNode$5.prototype.mergeSourceNode = function mergeSourceNode (otherNode) {
	if(this.source === otherNode.source &&
		this._endsWithNewLine &&
		this.startingLine + this._numberOfLines === otherNode.startingLine) {
		this.generatedCode += otherNode.generatedCode;
		this._numberOfLines += otherNode._numberOfLines;
		this._endsWithNewLine = otherNode._endsWithNewLine;
		return this;
	}
	return false;
};

SourceNode$5.prototype.mergeSingleLineNode = function mergeSingleLineNode (otherNode) {
	if(this.source === otherNode.source &&
		this._endsWithNewLine &&
		this.startingLine + this._numberOfLines === otherNode.line &&
		otherNode._numberOfLines <= 1) {
		this.addSingleLineNode(otherNode);
		return this;
	}
	return false;
};

SourceNode$5.prototype.addSingleLineNode = function addSingleLineNode (otherNode) {
	this.generatedCode += otherNode.generatedCode;
	this._numberOfLines += otherNode._numberOfLines
	this._endsWithNewLine = otherNode._endsWithNewLine;
};

var __moduleExports$18 = SourceNode$5;

var MappingsContext$1 = function MappingsContext() {
	this.sourcesIndices = new Map();
	this.sourcesContent = new Map();
	this.hasSourceContent = false;
	this.currentOriginalLine = 1;
	this.currentSource = 0;
	this.unfinishedGeneratedLine = false;
};

MappingsContext$1.prototype.ensureSource = function ensureSource (source, originalSource) {
	var idx = this.sourcesIndices.get(source);
	if(typeof idx === "number") {
		return idx;
	}
	idx = this.sourcesIndices.size;
	this.sourcesIndices.set(source, idx);
	this.sourcesContent.set(source, originalSource)
	if(typeof originalSource === "string")
		{ this.hasSourceContent = true; }
	return idx;
};

MappingsContext$1.prototype.getArrays = function getArrays () {
		var this$1 = this;

	var sources = [];
	var sourcesContent = [];

	for(var pair of this$1.sourcesContent) {
		sources.push(pair[0]);
		sourcesContent.push(pair[1]);
	}

	return {
		sources: sources,
		sourcesContent: sourcesContent
	};
};
var __moduleExports$21 = MappingsContext$1;

var getNumberOfLines = __moduleExports$17.getNumberOfLines;

var SourceListMap$2 = function SourceListMap(generatedCode, source, originalSource) {
	if(Array.isArray(generatedCode)) {
		this.children = generatedCode;
	} else {
		this.children = [];
		if(generatedCode || source)
			{ this.add(generatedCode, source, originalSource); }
	}
};

SourceListMap$2.prototype.add = function add (generatedCode, source, originalSource) {
	if(typeof generatedCode === "string") {
		if(source) {
			this.children.push(new __moduleExports$18(generatedCode, source, originalSource));
		} else if(this.children.length > 0 && this.children[this.children.length - 1] instanceof __moduleExports$16) {
			this.children[this.children.length - 1].addGeneratedCode(generatedCode);
		} else {
			this.children.push(new __moduleExports$16(generatedCode));
		}
	} else if(generatedCode.getMappings && generatedCode.getGeneratedCode) {
		this.children.push(generatedCode);
	} else if(generatedCode.children) {
		generatedCode.children.forEach(function(sln) {
			this.children.push(sln);
		}, this);
	} else {
		throw new Error("Invalid arguments to SourceListMap.protfotype.add: Expected string, Node or SourceListMap");
	}
};;

SourceListMap$2.prototype.preprend = function preprend (generatedCode, source, originalSource) {
	if(typeof generatedCode === "string") {
		if(source) {
			this.children.unshift(new __moduleExports$18(generatedCode, source, originalSource));
		} else if(this.children.length > 0 && this.children[this.children.length - 1].preprendGeneratedCode) {
			this.children[this.children.length - 1].preprendGeneratedCode(generatedCode);
		} else {
			this.children.unshift(new __moduleExports$16(generatedCode));
		}
	} else if(generatedCode.getMappings && generatedCode.getGeneratedCode) {
		this.children.unshift(generatedCode);
	} else if(generatedCode.children) {
		generatedCode.children.slice().reverse().forEach(function(sln) {
			this.children.unshift(sln);
		}, this);
	} else {
		throw new Error("Invalid arguments to SourceListMap.protfotype.prerend: Expected string, Node or SourceListMap");
	}
};;

SourceListMap$2.prototype.mapGeneratedCode = function mapGeneratedCode (fn) {
	var normalizedNodes = [];
	this.children.forEach(function(sln) {
		sln.getNormalizedNodes().forEach(function(newNode) {
			normalizedNodes.push(newNode);
		});
	});
	var optimizedNodes = [];
	normalizedNodes.forEach(function(sln) {
		sln = sln.mapGeneratedCode(fn);
		if(optimizedNodes.length === 0) {
			optimizedNodes.push(sln);
		} else {
			var last = optimizedNodes[optimizedNodes.length - 1];
			var mergedNode = last.merge(sln);
			if(mergedNode) {
				optimizedNodes[optimizedNodes.length - 1] = mergedNode;
			} else {
				optimizedNodes.push(sln);
			}
		}
	});
	return new SourceListMap$2(optimizedNodes);
};;

SourceListMap$2.prototype.toString = function toString () {
	return this.children.map(function(sln) {
		return sln.getGeneratedCode();
	}).join("");
};;

SourceListMap$2.prototype.toStringWithSourceMap = function toStringWithSourceMap (options) {
	var mappingsContext = new __moduleExports$21();
	var source = this.children.map(function(sln) {
		return sln.getGeneratedCode();
	}).join("");
	var mappings = this.children.map(function(sln) {
		return sln.getMappings(mappingsContext);
	}).join("");
	var arrays = mappingsContext.getArrays();
	return {
		source: source,
		map: {
			version: 3,
			file: options && options.file,
			sources: arrays.sources,
			sourcesContent: mappingsContext.hasSourceContent ? arrays.sourcesContent : undefined,
			mappings: mappings
		}
	};
};

var __moduleExports$15 = SourceListMap$2;

var __moduleExports$22 = function fromStringWithSourceMap(code, map) {
	var sources = map.sources;
	var sourcesContent = map.sourcesContent;
	var mappings = map.mappings.split(";");
	var lines = code.split("\n");
	var nodes = [];
	var currentNode = null;
	var currentLine = 1;
	var currentSourceIdx = 0;
	var currentSourceNodeLine;
	mappings.forEach(function(mapping, idx) {
		var line = lines[idx];
		if(typeof line === 'undefined') { return; }
		if(idx !== lines.length - 1) { line += "\n"; }
		if(!mapping)
			{ return addCode(line); }
		mapping = { value: 0, rest: mapping };
		var lineAdded = false;
		while(mapping.rest)
			{ lineAdded = processMapping(mapping, line, lineAdded) || lineAdded; }
		if(!lineAdded)
			{ addCode(line); }
	});
	if(mappings.length < lines.length) {
		var idx = mappings.length;
		while(!lines[idx].trim() && idx < lines.length-1) {
			addCode(lines[idx] + "\n");
			idx++;
		}
		addCode(lines.slice(idx).join("\n"));
	}
	return new __moduleExports$15(nodes);
	function processMapping(mapping, line, ignore) {
		if(mapping.rest && mapping.rest[0] !== ",") {
			__moduleExports$19.decode(mapping.rest, mapping);
		}
		if(!mapping.rest)
			{ return false; }
		if(mapping.rest[0] === ",") {
			mapping.rest = mapping.rest.substr(1);
			return false;
		}

		__moduleExports$19.decode(mapping.rest, mapping);
		var sourceIdx = mapping.value + currentSourceIdx;
		currentSourceIdx = sourceIdx;

		var linePosition;
		if(mapping.rest && mapping.rest[0] !== ",") {
			__moduleExports$19.decode(mapping.rest, mapping);
			linePosition = mapping.value + currentLine;
			currentLine = linePosition;
		} else {
			linePosition = currentLine;
		}

		if(mapping.rest) {
			var next = mapping.rest.indexOf(",");
			mapping.rest = next === -1 ? "" : mapping.rest.substr(next);
		}

		if(!ignore) {
			addSource(line, sources ? sources[sourceIdx] : null, sourcesContent ? sourcesContent[sourceIdx] : null, linePosition)
			return true;
		}
	}
	function addCode(generatedCode) {
		if(currentNode && currentNode instanceof __moduleExports$16) {
			currentNode.addGeneratedCode(generatedCode);
		} else if(currentNode && currentNode instanceof __moduleExports$18 && !generatedCode.trim()) {
			currentNode.addGeneratedCode(generatedCode);
			currentSourceNodeLine++;
		} else {
			currentNode = new __moduleExports$16(generatedCode);
			nodes.push(currentNode);
		}
	}
	function addSource(generatedCode, source, originalSource, linePosition) {
		if(currentNode && currentNode instanceof __moduleExports$18 &&
			currentNode.source === source &&
			currentSourceNodeLine === linePosition
		) {
			currentNode.addGeneratedCode(generatedCode);
			currentSourceNodeLine++;
		} else {
			currentNode = new __moduleExports$18(generatedCode, source, originalSource, linePosition);
			currentSourceNodeLine = linePosition + 1;
			nodes.push(currentNode);
		}
	}
};

var SourceListMap$1 = __moduleExports$15;
var SourceNode$4 = __moduleExports$18;
var SingleLineNode = __moduleExports$20;
var CodeNode = __moduleExports$16;
var MappingsContext = __moduleExports$21;
var fromStringWithSourceMap = __moduleExports$22;

var __moduleExports$14 = {
	SourceListMap: SourceListMap$1,
	SourceNode: SourceNode$4,
	SingleLineNode: SingleLineNode,
	CodeNode: CodeNode,
	MappingsContext: MappingsContext,
	fromStringWithSourceMap: fromStringWithSourceMap
};

var SourceNode$3 = __moduleExports$2.SourceNode;
var SourceListMap = __moduleExports$14.SourceListMap;

var RawSource$1 = (function (Source) {
	function RawSource(value) {
		Source.call(this);
		this._value = value;
	}

	if ( Source ) RawSource.__proto__ = Source;
	RawSource.prototype = Object.create( Source && Source.prototype );
	RawSource.prototype.constructor = RawSource;

	RawSource.prototype.source = function source () {
		return this._value;
	};

	RawSource.prototype.map = function map (options) {
		return null;
	};

	RawSource.prototype.node = function node (options) {
		return new SourceNode$3(null, null, null, this._value);
	};

	RawSource.prototype.listMap = function listMap (options) {
		return new SourceListMap(this._value);
	};

	RawSource.prototype.updateHash = function updateHash (hash) {
		hash.update(this._value);
	};

	return RawSource;
}(__moduleExports$1));

var __moduleExports$13 = RawSource$1;

var __moduleExports$24 = function mixinSourceAndMap(proto) {
	proto.map = function(options) {
		options = options || {};
		if(options.columns === false) {
			return this.listMap(options).toStringWithSourceMap({
				file: "x"
			}).map;
		}

		return this.node(options).toStringWithSourceMap({
			file: "x"
		}).map.toJSON();
	};

	proto.sourceAndMap = function(options) {
		options = options || {};
		if(options.columns === false) {
			//console.log(this.listMap(options).debugInfo());
			return this.listMap(options).toStringWithSourceMap({
				file: "x"
			});
		}

		var res = this.node(options).toStringWithSourceMap({
			file: "x"
		});
		return {
			source: res.code,
			map: res.map.toJSON()
		};
	};
}

var SourceNode$6 = __moduleExports$2.SourceNode;
var SourceMapConsumer$3 = __moduleExports$2.SourceMapConsumer;
var SourceListMap$3 = __moduleExports$14.SourceListMap;


function isSplitter(c) {
	switch(c) {
		case 10: // \n
		case 13: // \r
		case 59: // ;
		case 123: // {
		case 125: // }
			return true;
	}
	return false;
}

function _splitCode(code) {
	var result = [];
	var i = 0;
	var j = 0;
	for(; i < code.length; i++) {
		if(isSplitter(code.charCodeAt(i))) {
			while(isSplitter(code.charCodeAt(++i))){ ; }
			result.push(code.substring(j, i));
			j = i;
		}
	}
	if(j < code.length)
		{ result.push(code.substr(j)); }
	return result;
}

var OriginalSource$1 = (function (Source) {
	function OriginalSource(value, name) {
		Source.call(this);
		this._value = value;
		this._name = name;
	}

	if ( Source ) OriginalSource.__proto__ = Source;
	OriginalSource.prototype = Object.create( Source && Source.prototype );
	OriginalSource.prototype.constructor = OriginalSource;

	OriginalSource.prototype.source = function source () {
		return this._value;
	};

	OriginalSource.prototype.node = function node (options) {
		options = options || {};
		var sourceMap = this._sourceMap;
		var value = this._value;
		var name = this._name;
		var lines = value.split("\n");
		var node = new SourceNode$6(null, null, null,
			lines.map(function(line, idx) {
				var pos = 0;
				if(options.columns === false) {
					var content = line + (idx != lines.length - 1 ? "\n" : "");
					return new SourceNode$6(idx + 1, 0, name, content);
				}
				return new SourceNode$6(null, null, null,
					_splitCode(line + (idx != lines.length - 1 ? "\n" : "")).map(function(item) {
						if(/^\s*$/.test(item)) { return item; }
						var res = new SourceNode$6(idx + 1, pos, name, item);
						pos += item.length;
						return res;
					})
				);
			})
		);
		node.setSourceContent(name, value);
		return node;
	};

	OriginalSource.prototype.listMap = function listMap (options) {
		return new SourceListMap$3(this._value, this._name, this._value)
	};

	OriginalSource.prototype.updateHash = function updateHash (hash) {
		hash.update(this._value);
	};

	return OriginalSource;
}(__moduleExports$1));

__moduleExports$24(OriginalSource$1.prototype);

var __moduleExports$23 = OriginalSource$1;

var SourceNode$7 = __moduleExports$2.SourceNode;
var SourceMapConsumer$4 = __moduleExports$2.SourceMapConsumer;
var SourceMapGenerator$3 = __moduleExports$2.SourceMapGenerator;
var SourceListMap$4 = __moduleExports$14.SourceListMap;
var fromStringWithSourceMap$1 = __moduleExports$14.fromStringWithSourceMap;


var SourceMapSource$1 = (function (Source) {
	function SourceMapSource(value, name, sourceMap, originalSource, innerSourceMap) {
		Source.call(this);
		this._value = value;
		this._name = name;
		this._sourceMap = sourceMap;
		this._originalSource = originalSource;
		this._innerSourceMap = innerSourceMap;
	}

	if ( Source ) SourceMapSource.__proto__ = Source;
	SourceMapSource.prototype = Object.create( Source && Source.prototype );
	SourceMapSource.prototype.constructor = SourceMapSource;

	SourceMapSource.prototype.source = function source () {
		return this._value;
	};

	SourceMapSource.prototype.node = function node (options) {
		var innerSourceMap = this._innerSourceMap;
		var sourceMap = this._sourceMap;
		if(innerSourceMap) {
			sourceMap = SourceMapGenerator$3.fromSourceMap(new SourceMapConsumer$4(sourceMap));
			if(this._originalSource)
				{ sourceMap.setSourceContent(this._name, this._originalSource); }
			innerSourceMap = new SourceMapConsumer$4(innerSourceMap);
			sourceMap.applySourceMap(innerSourceMap, this._name);
			sourceMap = sourceMap.toJSON();
		}
		return SourceNode$7.fromStringWithSourceMap(this._value, new SourceMapConsumer$4(sourceMap));
	};

	SourceMapSource.prototype.listMap = function listMap (options) {
		options = options || {};
		if(options.module === false)
			{ return new SourceListMap$4(this._value, this._name, this._value); }
		return fromStringWithSourceMap$1(this._value, typeof this._sourceMap === "string" ? JSON.parse(this._sourceMap) : this._sourceMap);
	};

	SourceMapSource.prototype.updateHash = function updateHash (hash) {
		hash.update(this._value);
		if(this._originalSource)
			{ hash.update(this._originalSource); }
	};

	return SourceMapSource;
}(__moduleExports$1));

__moduleExports$24(SourceMapSource$1.prototype);

var __moduleExports$25 = SourceMapSource$1;

var SourceNode$8 = __moduleExports$2.SourceNode;
var SourceMapConsumer$5 = __moduleExports$2.SourceMapConsumer;
var SourceListMap$5 = __moduleExports$14.SourceListMap;


var LineToLineMappedSource$1 = (function (Source) {
	function LineToLineMappedSource(value, name, originalSource) {
		Source.call(this);
		this._value = value;
		this._name = name;
		this._originalSource = originalSource;
	}

	if ( Source ) LineToLineMappedSource.__proto__ = Source;
	LineToLineMappedSource.prototype = Object.create( Source && Source.prototype );
	LineToLineMappedSource.prototype.constructor = LineToLineMappedSource;

	LineToLineMappedSource.prototype.source = function source () {
		return this._value;
	};

	LineToLineMappedSource.prototype.node = function node (options) {
		var value = this._value;
		var name = this._name;
		var lines = value.split("\n");
		var node = new SourceNode$8(null, null, null,
			lines.map(function(line, idx) {
				return new SourceNode$8(idx + 1, 0, name, (line + (idx != lines.length - 1 ? "\n" : "")));
			})
		);
		node.setSourceContent(name, this._originalSource);
		return node;
	};

	LineToLineMappedSource.prototype.listMap = function listMap (options) {
		return new SourceListMap$5(this._value, this._name, this._originalSource)
	};

	LineToLineMappedSource.prototype.updateHash = function updateHash (hash) {
		hash.update(this._value);
		hash.update(this._originalSource);
	};

	return LineToLineMappedSource;
}(__moduleExports$1));

__moduleExports$24(LineToLineMappedSource$1.prototype);

var __moduleExports$26 = LineToLineMappedSource$1;

var CachedSource$1 = (function (Source) {
	function CachedSource(source) {
		Source.call(this);
		this._source = source;
		this._cachedSource = undefined;
		this._cachedSize = undefined;
		this._cachedMaps = {};

		if(source.node) { this.node = function(options) {
			return this._source.node(options);
		}; }

		if(source.listMap) { this.listMap = function(options) {
			return this._source.listMap(options);
		}; }
	}

	if ( Source ) CachedSource.__proto__ = Source;
	CachedSource.prototype = Object.create( Source && Source.prototype );
	CachedSource.prototype.constructor = CachedSource;

	CachedSource.prototype.source = function source () {
		if(typeof this._cachedSource !== "undefined") { return this._cachedSource; }
		return this._cachedSource = this._source.source();
	};

	CachedSource.prototype.size = function size () {
		if(typeof this._cachedSize !== "undefined") { return this._cachedSize; }
		if(typeof this._cachedSource !== "undefined")
			{ return this._cachedSize = this._cachedSource.length; }
		return this._cachedSize = this._source.size();
	};

	CachedSource.prototype.sourceAndMap = function sourceAndMap (options) {
		var key = JSON.stringify(options);
		if(typeof this._cachedSource !== "undefined" && key in this._cachedMaps)
			{ return {
				source: this._cachedSource,
				map: this._cachedMaps[key]
			}; }
		else if(typeof this._cachedSource !== "undefined") {
			return {
				source: this._cachedSource,
				map: this._cachedMaps[key] = this._source.map(options)
			};
		} else if(key in this._cachedMaps) {
			return {
				source: this._cachedSource = this._source.source(),
				map: this._cachedMaps[key]
			};
		}
		var result = this._source.sourceAndMap(options);
		this._cachedSource = result.source;
		this._cachedMaps[key] = result.map;
		return {
			source: this._cachedSource,
			map: this._cachedMaps[key]
		};
	};

	CachedSource.prototype.map = function map (options) {
		if(!options) { options = {}; }
		var key = JSON.stringify(options);
		if(key in this._cachedMaps)
			{ return this._cachedMaps[key]; }
		return this._cachedMaps[key] = this._source.map();
	};

	CachedSource.prototype.updateHash = function updateHash (hash) {
		this._source.updateHash(hash);
	};

	return CachedSource;
}(__moduleExports$1));

var __moduleExports$27 = CachedSource$1;

var SourceNode$9 = __moduleExports$2.SourceNode;
var SourceListMap$6 = __moduleExports$14.SourceListMap;


var ConcatSource$1 = (function (Source) {
	function ConcatSource() {
		Source.call(this);
		this.children = Array.prototype.slice.call(arguments);
	}

	if ( Source ) ConcatSource.__proto__ = Source;
	ConcatSource.prototype = Object.create( Source && Source.prototype );
	ConcatSource.prototype.constructor = ConcatSource;

	ConcatSource.prototype.add = function add (item) {
		this.children.push(item);
	};

	ConcatSource.prototype.source = function source () {
		return this.children.map(function(item) {
			return typeof item === "string" ? item : item.source();
		}).join("");
	};

	ConcatSource.prototype.size = function size () {
		return this.children.map(function(item) {
			return typeof item === "string" ? item.length : item.size();
		}).reduce(function(sum, s) {
			return sum + s;
		}, 0);
	};

	ConcatSource.prototype.node = function node (options) {
		var node = new SourceNode$9(null, null, null, this.children.map(function(item) {
			return typeof item === "string" ? item : item.node(options);
		}));
		return node;
	};

	ConcatSource.prototype.listMap = function listMap (options) {
		var map = new SourceListMap$6();
		this.children.forEach(function(item) {
			if(typeof item === "string")
				{ map.add(item); }
			else
				{ map.add(item.listMap(options)); }
		});
		return map;
	};

	ConcatSource.prototype.updateHash = function updateHash (hash) {
		this.children.forEach(function(item) {
			if(typeof item === "string")
				{ hash.update(item); }
			else
				{ item.updateHash(hash); }
		});
	};

	return ConcatSource;
}(__moduleExports$1));

__moduleExports$24(ConcatSource$1.prototype);

var __moduleExports$28 = ConcatSource$1;

var SourceNode$10 = __moduleExports$2.SourceNode;
var SourceListMap$7 = __moduleExports$14.SourceListMap;
var fromStringWithSourceMap$2 = __moduleExports$14.fromStringWithSourceMap;
var SourceMapConsumer$6 = __moduleExports$2.SourceMapConsumer;

var ReplaceSource$1 = (function (Source) {
	function ReplaceSource(source, name) {
		Source.call(this);
		this._source = source;
		this._name = name;
		this.replacements = [];
	}

	if ( Source ) ReplaceSource.__proto__ = Source;
	ReplaceSource.prototype = Object.create( Source && Source.prototype );
	ReplaceSource.prototype.constructor = ReplaceSource;

	ReplaceSource.prototype.replace = function replace (start, end, newValue) {
		if(typeof newValue !== "string")
			{ throw new Error("insertion must be a string, but is a " + typeof newValue); }
		this.replacements.push([start, end, newValue, this.replacements.length]);
	};

	ReplaceSource.prototype.insert = function insert (pos, newValue) {
		if(typeof newValue !== "string")
			{ throw new Error("insertion must be a string, but is a " + typeof newValue + ": " + newValue); }
		this.replacements.push([pos, pos - 1, newValue, this.replacements.length]);
	};

	ReplaceSource.prototype.source = function source (options) {
		return this._replaceString(this._source.source());
	};

	ReplaceSource.prototype.original = function original () {
		return this._source;
	};

	ReplaceSource.prototype._sortReplacements = function _sortReplacements () {
		this.replacements.sort(function(a, b) {
			var diff = b[1] - a[1];
			if(diff !== 0)
				{ return diff; }
			diff = b[0] - a[0];
			if(diff !== 0)
				{ return diff; }
			return b[3] - a[3];
		});
	};

	ReplaceSource.prototype._replaceString = function _replaceString (str) {
		if(typeof str !== "string")
			{ throw new Error("str must be a string, but is a " + typeof str + ": " + str); }
		this._sortReplacements();
		var result = [str];
		this.replacements.forEach(function(repl) {
			var remSource = result.pop();
			var splitted1 = this._splitString(remSource, Math.floor(repl[1] + 1));
			var splitted2 = this._splitString(splitted1[0], Math.floor(repl[0]));
			result.push(splitted1[1], repl[2], splitted2[0]);
		}, this);
		result = result.reverse();
		return result.join("");
	};

	ReplaceSource.prototype.node = function node (options) {
		this._sortReplacements();
		var result = [this._source.node(options)];
		this.replacements.forEach(function(repl) {
			var remSource = result.pop();
			var splitted1 = this._splitSourceNode(remSource, Math.floor(repl[1] + 1));
			var splitted2;
			if(Array.isArray(splitted1)) {
				splitted2 = this._splitSourceNode(splitted1[0], Math.floor(repl[0]));
				if(Array.isArray(splitted2)) {
					result.push(splitted1[1], this._replacementToSourceNode(splitted2[1], repl[2]), splitted2[0]);
				} else {
					result.push(splitted1[1], this._replacementToSourceNode(splitted1[1], repl[2]), splitted1[0]);
				}
			} else {
				splitted2 = this._splitSourceNode(remSource, Math.floor(repl[0]));
				if(Array.isArray(splitted2)) {
					result.push(this._replacementToSourceNode(splitted2[1], repl[2]), splitted2[0]);
				} else {
					result.push(repl[2], remSource);
				}
			}
		}, this);
		result = result.reverse();
		return new SourceNode$10(null, null, null, result);
	};

	ReplaceSource.prototype.listMap = function listMap (options) {
		this._sortReplacements();
		var map = this._source.listMap(options);
		var currentIndex = 0;
		var replacements = this.replacements;
		var idxReplacement = replacements.length - 1;
		var removeChars = 0;
		map = map.mapGeneratedCode(function(str) {
			var newCurrentIndex = currentIndex + str.length;
			if(removeChars > str.length) {
				removeChars -= str.length;
				str = "";
			} else {
				if(removeChars > 0) {
					str = str.substr(removeChars);
					currentIndex += removeChars;
					removeChars = 0;
				}
				var finalStr = "";
				while(idxReplacement >= 0 && replacements[idxReplacement][0] < newCurrentIndex) {
					var repl = replacements[idxReplacement];
					var start = Math.floor(repl[0]);
					var end = Math.floor(repl[1] + 1);
					var before = str.substr(0, Math.max(0, start - currentIndex));
					if(end <= newCurrentIndex) {
						var after = str.substr(Math.max(0, end - currentIndex));
						finalStr += before + repl[2];
						str = after;
						currentIndex = Math.max(currentIndex, end);
					} else {
						finalStr += before + repl[2];
						str = "";
						removeChars = end - newCurrentIndex;
					}
					idxReplacement--;
				}
				str = finalStr + str;
			}
			currentIndex = newCurrentIndex;
			return str;
		});
		var extraCode = "";
		while(idxReplacement >= 0) {
			extraCode += replacements[idxReplacement][2];
			idxReplacement--;
		}
		if(extraCode) {
			map.add(extraCode);
		}
		return map;
	};

	ReplaceSource.prototype._replacementToSourceNode = function _replacementToSourceNode (oldNode, newString) {
		var map = oldNode.toStringWithSourceMap({
			file: "?"
		}).map;
		var original = new SourceMapConsumer$6(map.toJSON()).originalPositionFor({
			line: 1,
			column: 0
		});
		if(original) {
			return new SourceNode$10(original.line, original.column, original.source, newString);
		} else {
			return newString;
		}
	};

	ReplaceSource.prototype._splitSourceNode = function _splitSourceNode (node, position) {
		var this$1 = this;

		if(typeof node === "string") {
			if(node.length <= position) { return position - node.length; }
			return position <= 0 ? ["", node] : [node.substr(0, position), node.substr(position)];
		} else {
			for(var i = 0; i < node.children.length; i++) {
				position = this$1._splitSourceNode(node.children[i], position);
				if(Array.isArray(position)) {
					var leftNode = new SourceNode$10(
						node.line,
						node.column,
						node.source,
						node.children.slice(0, i).concat([position[0]]),
						node.name
					);
					var rightNode = new SourceNode$10(
						node.line,
						node.column,
						node.source, [position[1]].concat(node.children.slice(i + 1)),
						node.name
					);
					leftNode.sourceContents = node.sourceContents;
					return [leftNode, rightNode];
				}
			}
			return position;
		}
	};

	ReplaceSource.prototype._splitString = function _splitString (str, position) {
		return position <= 0 ? ["", str] : [str.substr(0, position), str.substr(position)];
	};

	return ReplaceSource;
}(__moduleExports$1));

__moduleExports$24(ReplaceSource$1.prototype);

var __moduleExports$29 = ReplaceSource$1;

var SourceNode$11 = __moduleExports$2.SourceNode;

var REPLACE_REGEX = /\n(?=.|\s)/g;

function cloneAndPrefix(node, prefix, append) {
	if(typeof node === "string") {
		var result = node.replace(REPLACE_REGEX, "\n" + prefix);
		if(append.length > 0) { result = append.pop() + result; }
		if(/\n$/.test(node)) { append.push(prefix); }
		return result;
	} else {
		var newNode = new SourceNode$11(
			node.line,
			node.column,
			node.source,
			node.children.map(function(node) {
				return cloneAndPrefix(node, prefix, append);
			}),
			node.name
		);
		newNode.sourceContents = node.sourceContents;
		return newNode;
	}
};

var PrefixSource$1 = (function (Source) {
	function PrefixSource(prefix, source) {
		Source.call(this);
		this._source = source;
		this._prefix = prefix;
	}

	if ( Source ) PrefixSource.__proto__ = Source;
	PrefixSource.prototype = Object.create( Source && Source.prototype );
	PrefixSource.prototype.constructor = PrefixSource;

	PrefixSource.prototype.source = function source () {
		var node = typeof this._source === "string" ? this._source : this._source.source();
		var prefix = this._prefix;
		return prefix + node.replace(REPLACE_REGEX, "\n" + prefix);
	};

	PrefixSource.prototype.node = function node (options) {
		var node = this._source.node(options);
		var append = [this._prefix];
		return new SourceNode$11(null, null, null, [
			cloneAndPrefix(node, this._prefix, append)
		]);
	};

	PrefixSource.prototype.listMap = function listMap (options) {
		var prefix = this._prefix;
		var map = this._source.listMap(options);
		return map.mapGeneratedCode(function(code) {
			return prefix + code.replace(REPLACE_REGEX, "\n" + prefix);
		});
	};

	PrefixSource.prototype.updateHash = function updateHash (hash) {
		if(typeof this._source === "string")
			{ hash.update(this._source); }
		else
			{ this._source.updateHash(hash); }
		if(typeof this._prefix === "string")
			{ hash.update(this._prefix); }
		else
			{ this._prefix.updateHash(hash); }
	};

	return PrefixSource;
}(__moduleExports$1));

__moduleExports$24(PrefixSource$1.prototype);

var __moduleExports$30 = PrefixSource$1;

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var Source = __moduleExports$1;

var RawSource = __moduleExports$13;
var OriginalSource = __moduleExports$23;
var SourceMapSource = __moduleExports$25;
var LineToLineMappedSource = __moduleExports$26;

var CachedSource = __moduleExports$27;
var ConcatSource = __moduleExports$28;
var ReplaceSource = __moduleExports$29;
var PrefixSource = __moduleExports$30;

var index$2 = {
	Source: Source,
	RawSource: RawSource,
	OriginalSource: OriginalSource,
	SourceMapSource: SourceMapSource,
	LineToLineMappedSource: LineToLineMappedSource,
	CachedSource: CachedSource,
	ConcatSource: ConcatSource,
	ReplaceSource: ReplaceSource,
	PrefixSource: PrefixSource
};

var ModuleFilenameHelpers_1 = createCommonjsModule(function (module, exports) {
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

var ModuleFilenameHelpers = exports;

ModuleFilenameHelpers.ALL_LOADERS_RESOURCE = "[all-loaders][resource]";
ModuleFilenameHelpers.REGEXP_ALL_LOADERS_RESOURCE = /\[all-?loaders\]\[resource\]/gi;
ModuleFilenameHelpers.LOADERS_RESOURCE = "[loaders][resource]";
ModuleFilenameHelpers.REGEXP_LOADERS_RESOURCE = /\[loaders\]\[resource\]/gi;
ModuleFilenameHelpers.RESOURCE = "[resource]";
ModuleFilenameHelpers.REGEXP_RESOURCE = /\[resource\]/gi;
ModuleFilenameHelpers.ABSOLUTE_RESOURCE_PATH = "[absolute-resource-path]";
ModuleFilenameHelpers.REGEXP_ABSOLUTE_RESOURCE_PATH = /\[abs(olute)?-?resource-?path\]/gi;
ModuleFilenameHelpers.RESOURCE_PATH = "[resource-path]";
ModuleFilenameHelpers.REGEXP_RESOURCE_PATH = /\[resource-?path\]/gi;
ModuleFilenameHelpers.ALL_LOADERS = "[all-loaders]";
ModuleFilenameHelpers.REGEXP_ALL_LOADERS = /\[all-?loaders\]/gi;
ModuleFilenameHelpers.LOADERS = "[loaders]";
ModuleFilenameHelpers.REGEXP_LOADERS = /\[loaders\]/gi;
ModuleFilenameHelpers.QUERY = "[query]";
ModuleFilenameHelpers.REGEXP_QUERY = /\[query\]/gi;
ModuleFilenameHelpers.ID = "[id]";
ModuleFilenameHelpers.REGEXP_ID = /\[id\]/gi;
ModuleFilenameHelpers.HASH = "[hash]";
ModuleFilenameHelpers.REGEXP_HASH = /\[hash\]/gi;

function getAfter(str, token) {
	var idx = str.indexOf(token);
	return idx < 0 ? "" : str.substr(idx);
}

function getBefore(str, token) {
	var idx = str.lastIndexOf(token);
	return idx < 0 ? "" : str.substr(0, idx);
}

function getHash(str) {
	var hash = crypto.createHash("md5");
	hash.update(str);
	return hash.digest("hex").substr(0, 4);
}

function asRegExp(test) {
	if(typeof test === "string") { test = new RegExp("^" + test.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")); }
	return test;
}

ModuleFilenameHelpers.createFilename = function createFilename(module, moduleFilenameTemplate, requestShortener) {
	var absoluteResourcePath;
	var hash;
	var identifier;
	var moduleId;
	var shortIdentifier;
	if(module === undefined) { module = ""; }
	if(typeof module === "string") {
		shortIdentifier = requestShortener.shorten(module);
		identifier = shortIdentifier;
		moduleId = "";
		absoluteResourcePath = module.split("!").pop();
		hash = getHash(identifier);
	} else {
		shortIdentifier = module.readableIdentifier(requestShortener);
		identifier = requestShortener.shorten(module.identifier());
		moduleId = module.id;
		absoluteResourcePath = module.identifier().split("!").pop();
		hash = getHash(identifier);
	}
	var resource = shortIdentifier.split("!").pop();
	var loaders = getBefore(shortIdentifier, "!");
	var allLoaders = getBefore(identifier, "!");
	var query = getAfter(resource, "?");
	var resourcePath = resource.substr(0, resource.length - query.length);
	if(typeof moduleFilenameTemplate === "function") {
		return moduleFilenameTemplate({
			identifier: identifier,
			shortIdentifier: shortIdentifier,
			resource: resource,
			resourcePath: resourcePath,
			absoluteResourcePath: absoluteResourcePath,
			allLoaders: allLoaders,
			query: query,
			moduleId: moduleId,
			hash: hash
		});
	}
	return moduleFilenameTemplate
		.replace(ModuleFilenameHelpers.REGEXP_ALL_LOADERS_RESOURCE, identifier)
		.replace(ModuleFilenameHelpers.REGEXP_LOADERS_RESOURCE, shortIdentifier)
		.replace(ModuleFilenameHelpers.REGEXP_RESOURCE, resource)
		.replace(ModuleFilenameHelpers.REGEXP_RESOURCE_PATH, resourcePath)
		.replace(ModuleFilenameHelpers.REGEXP_ABSOLUTE_RESOURCE_PATH, absoluteResourcePath)
		.replace(ModuleFilenameHelpers.REGEXP_ALL_LOADERS, allLoaders)
		.replace(ModuleFilenameHelpers.REGEXP_LOADERS, loaders)
		.replace(ModuleFilenameHelpers.REGEXP_QUERY, query)
		.replace(ModuleFilenameHelpers.REGEXP_ID, moduleId)
		.replace(ModuleFilenameHelpers.REGEXP_HASH, hash);
};

ModuleFilenameHelpers.createFooter = function createFooter(module, requestShortener) {
	if(!module) { module = ""; }
	if(typeof module === "string") {
		return [
			"// WEBPACK FOOTER //",
			("// " + (requestShortener.shorten(module)))
		].join("\n");
	} else {
		return [
			"//////////////////",
			"// WEBPACK FOOTER",
			("// " + (module.readableIdentifier(requestShortener))),
			("// module id = " + (module.id)),
			("// module chunks = " + (module.chunks.map(function (c) { return c.id; }).join(" ")))
		].join("\n");
	}
};

ModuleFilenameHelpers.replaceDuplicates = function replaceDuplicates(array, fn, comparator) {
	var countMap = Object.create(null);
	var posMap = Object.create(null);
	array.forEach(function (item, idx) {
		countMap[item] = (countMap[item] || []);
		countMap[item].push(idx);
		posMap[item] = 0;
	});
	if(comparator) {
		Object.keys(countMap).forEach(function (item) {
			countMap[item].sort(comparator);
		});
	}
	return array.map(function (item, i) {
		if(countMap[item].length > 1) {
			if(comparator && countMap[item][0] === i)
				{ return item; }
			return fn(item, i, posMap[item]++);
		} else { return item; }
	});
};

ModuleFilenameHelpers.matchPart = function matchPart(str, test) {
	if(!test) { return true; }
	test = asRegExp(test);
	if(Array.isArray(test)) {
		return test.map(asRegExp).filter(function(regExp) {
			return regExp.test(str);
		}).length > 0;
	} else {
		return test.test(str);
	}
};

ModuleFilenameHelpers.matchObject = function matchObject(obj, str) {
	if(obj.test)
		{ if(!ModuleFilenameHelpers.matchPart(str, obj.test)) { return false; } }
	if(obj.include)
		{ if(!ModuleFilenameHelpers.matchPart(str, obj.include)) { return false; } }
	if(obj.exclude)
		{ if(ModuleFilenameHelpers.matchPart(str, obj.exclude)) { return false; } }
	return true;
};
});

var defaultCondition = {

}

function generateDowngradeCode (options) {
  var condition = options.condition || defaultCondition
  return '// TODO: generate downgrade codes here\n'
}

var WeexDowngradePlugin = function WeexDowngradePlugin (options) {
  this.options = options || {}
};

WeexDowngradePlugin.prototype.apply = function apply (compiler) {
  var code = generateDowngradeCode(this.options)

  compiler.plugin('compilation', function (compilation) {
    compilation.plugin('optimize-chunk-assets', function (chunks, callback) {
      chunks.forEach(function (chunk) {
        if ('isInitial' in chunk && !chunk.isInitial()) { return; }

        chunk.files.forEach(function (file) { return compilation.assets[file] = new ConcatSource(
            code.replace(/\[filename\]/g, file), '\n', compilation.assets[file]
          ); }
        )
      })
      callback()
    })
  })
};

module.exports = WeexDowngradePlugin;