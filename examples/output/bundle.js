// { "framework": "Vue" }

/* Weex downgrade configs */
;(function(){
  /* npm downgrade nodule */
  var MODULE_NAME = 'instanceWrap';
  var DOWNGRADE_TYPE = 1;
  var DOWNGRADE_ERROR_CODE = 1003;
  var DOWNGRADE_MSG = 'Force downgrade to web';
  
  function satisfies(left, right) {
    let regex = /(\W+)?([\d|.]+)/
  
    if (typeof left + typeof right !== 'stringstring')
    return false
  
    // *匹配所有
    if (right == '*') {
      return true
    }
  
    let arr = right.match(regex)
    let a = left.split('.')
    let i = 0
    let b = arr[2].split('.')
    let len = Math.max(a.length, b.length)
  
    let flag = 0
    for (let i = 0; i < len; i++) {
      if ((a[i] && !b[i] && parseInt(a[i]) > 0) || (parseInt(a[i]) > parseInt(b[i]))) {
        flag = 1
        break
      } else if ((b[i] && !a[i] && parseInt(b[i]) > 0) || (parseInt(a[i]) < parseInt(b[i]))) {
        flag = -1
        break
      }
    }
  
    switch (arr[1]) {
      case '<':
      if (flag === -1) {
        return true
      }
      break
      case '<=':
      if (flag !== 1) {
        return true
      }
      break
      case '>':
      if (flag === 1) {
        return true
      }
      break
      case '>=':
      if (flag !== -1) {
        return true
      }
      break
      default:
      if (flag === 0) {
        return true
      }
      break
    }
  
    return false
  }
  
  
  /**
  * @private
  * Using async type to check environment
  */
  function isWeex() {
    return typeof window !== 'object' && typeof callNative !== 'undefined';
  }
  
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
    if (!isWeex()) return false;
    type = parseInt(type) || DOWNGRADE_TYPE;
    errorCode = parseInt(errorCode) || DOWNGRADE_ERROR_CODE;
    message = isString(message) ? message : DOWNGRADE_MSG;
    getInstanceWrap()['error'](type, errorCode, message);
    return true;
  }
  
  
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
  
        if (satisfies(d, c)) {
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
  
  function condition (config) {
    var diagnose = check(config);
    if (diagnose.isDowngrade) {
      force(diagnose.errorType, diagnose.code, diagnose.errorMessage);
    }
  
    return diagnose.isDowngrade;
  }
  

  /* downgrade condition */
  condition(
    {
      "ios": {
        "osVersion": ">1.0",
        "appVersion": ">1.0.0",
        "weexVersion": ">1",
        "deviceModel": [
          "iPhone5,1"
        ]
      },
      "android": {
        "osVersion": ">1.0",
        "appVersion": ">1.0.0",
        "weexVersion": ">1",
        "deviceModel": [
          "G-2PW2100"
        ]
      }
    }
  );
  
})();

/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__
var __vue_styles__ = []

/* styles */
__vue_styles__.push(__webpack_require__(2)
)

/* template */
var __vue_template__ = __webpack_require__(3)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (
  typeof __vue_exports__.default === "object" ||
  typeof __vue_exports__.default === "function"
) {
if (Object.keys(__vue_exports__).some(function (key) { return key !== "default" && key !== "__esModule" })) {console.error("named exports are not supported in *.vue files.")}
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.__file = "/Users/Hanks/Codes/test/downgrade/examples/app.vue"
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns
__vue_options__._scopeId = "data-v-3c7cc2ef"
__vue_options__.style = __vue_options__.style || {}
__vue_styles__.forEach(function (module) {
  for (var name in module) {
    __vue_options__.style[name] = module[name]
  }
})
if (typeof __register_static_styles__ === "function") {
  __register_static_styles__(__vue_options__._scopeId, __vue_styles__)
}

module.exports = __vue_exports__


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__app_vue__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__app_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__app_vue__);


__WEBPACK_IMPORTED_MODULE_0__app_vue___default.a.el = '#root';

new Vue(__WEBPACK_IMPORTED_MODULE_0__app_vue___default.a);

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = {
  "wrapper": {
    "flexDirection": "column",
    "justifyContent": "center"
  },
  "weex": {
    "fontSize": 80,
    "textAlign": "center",
    "color": "#1B90F7"
  },
  "vue": {
    "fontSize": 80,
    "textAlign": "center",
    "marginTop": 30,
    "color": "#41B883"
  }
}

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _vm._m(0)
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: ["wrapper"]
  }, [_c('text', {
    staticClass: ["weex"]
  }, [_vm._v("Hello Weex")]), _c('text', {
    staticClass: ["vue"]
  }, [_vm._v("Hello Vue")])])
}]}
module.exports.render._withStripped = true

/***/ })
/******/ ]);