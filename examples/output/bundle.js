// { "framework": "Vue" }

/* Weex downgrade configs */
;(function(){
  /* npm downgrade nodule */
  !function(e,r){"object"==typeof exports&&"undefined"!=typeof module?module.exports=r():"function"==typeof define&&define.amd?define(r):e.WeexDowngrade=r()}(this,function(){"use strict";function e(){return"object"!=typeof window&&"undefined"!=typeof callNative}function r(){try{return weex.requireModule(s)}catch(e){}try{return __weex_require__("@weex-module/"+s)}catch(e){}return{error:function(){console&&console.log&&console.log("Can not found module "+s)}}}function n(n,t,i){return!!e()&&(n=parseInt(n)||u,t=parseInt(t)||c,i=o(i)?i:d,r().error(n,t,i),!0)}function t(r){var n={isDowngrade:!1};if(!e())return n;var t=WXEnvironment||{},o=r[(t.platform||"unknow").toLowerCase()]||{};for(var s in t){var u=s.toLowerCase(),c=t[s],d=u.indexOf("version")>=0,p=u.indexOf("devicemodel")>=0,l=o[s];if(l&&d){var v=i(l),w=i(t[s]);if(f.satisfies(w,v)){n=a(s,c,l);break}}else if(p&&(Array.isArray(l)?l:[l]).indexOf(c)>=0){n=a(s,c,l);break}}return n}function o(e){return"string"==typeof e}function i(e){if("*"===e)return e;for(var r=(e=o(e)?e:"").split("."),n=0,t=[];n<3;){var i=o(r[n])&&r[n]?r[n]:"0";t.push(i),n++}return t.join(".")}function a(e,r,n){var t={isDowngrade:!0,errorType:1,code:1e3},o=e.toLowerCase();return o.indexOf("osversion")>=0?t.code=1001:o.indexOf("appversion")>=0?t.code=1002:o.indexOf("weexversion")>=0?t.code=1003:o.indexOf("devicemodel")>=0&&(t.code=1004),t.errorMessage="Downgrade["+e+"]: envInfo "+r+" matched criteria "+n,t}var f={satisfies:function(e,r){var n=/(\W+)?([\d|.]+)/;if(typeof e+typeof r!="stringstring")return!1;if("*"==r)return!0;for(var t=r.match(n),o=e.split("."),i=t[2].split("."),a=Math.max(o.length,i.length),f=0,s=0;s<a;s++){if(o[s]&&!i[s]&&parseInt(o[s])>0||parseInt(o[s])>parseInt(i[s])){f=1;break}if(i[s]&&!o[s]&&parseInt(i[s])>0||parseInt(o[s])<parseInt(i[s])){f=-1;break}}switch(t[1]){case"<":if(-1===f)return!0;break;case"<=":if(1!==f)return!0;break;case">":if(1===f)return!0;break;case">=":if(-1!==f)return!0;break;default:if(0===f)return!0}return!1}},s="instanceWrap",u=1,c=1003,d="Force downgrade to web";return{force:n,check:t,condition:function(e){var r=t(e);return r.isDowngrade&&n(r.errorType,r.code,r.errorMessage),r.isDowngrade},semverLite:f}});

  /* downgrade condition */
  WeexDowngrade.condition(
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