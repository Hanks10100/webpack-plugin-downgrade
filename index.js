'use strict';

var webpackSources = require('webpack-sources');

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

        chunk.files.forEach(function (file) { return compilation.assets[file] = new webpackSources.ConcatSource(
            code.replace(/\[filename\]/g, file), '\n', compilation.assets[file]
          ); }
        )
      })
      callback()
    })
  })
};

module.exports = WeexDowngradePlugin;