'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));
var path = require('path');
var webpackSources = require('webpack-sources');

// import Downgrade from '@weex-project/downgrade'
function readDowngradeFunction () {
  try {
    return fs.readFileSync('./downgrade.js', 'utf8')
  } catch(e) {
    console.log('Error:', e.stack)
    return '/* invalid downgrade code */'
  }
}

function indent (codes) {
  return codes.replace(/\n/g, '\n  ')
}


var defaultCondition = {
}

function generateDowngradeCode (options) {
  var condition = options.condition || defaultCondition
  return '// TODO: generate downgrade codes here' +
"\n;(function(){\n  /* npm downgrade nodule */\n  " + (indent(readDowngradeFunction())) + "\n\n  /* downgrade config */\n})();\n\n"
}

var WeexDowngradePlugin = function WeexDowngradePlugin (options) {
  this.options = options || {}
};

WeexDowngradePlugin.prototype.apply = function apply (compiler) {
  var code = generateDowngradeCode(this.options)

  compiler.plugin('compilation', function (compilation) {
    compilation.plugin('optimize-chunk-assets', function (chunks, callback) {
      // console.log(' => optimize-chunk-assets\n')
      chunks.forEach(function (chunk) {
        if ('isInitial' in chunk && !chunk.isInitial()) { return; }

        chunk.files.forEach(function (file) {
          compilation.assets[file] = new webpackSources.ConcatSource(code, compilation.assets[file])
        })
      })
      callback()
    })

    compilation.plugin('additional-assets', function (callback) {
      // console.log(' => additional-assets\n')
      callback()
    })

    // compilation.plugin('additional-chunk-assets', chunks => {
    // // console.log(console.log(chunks))
    // chunks.forEach(chunk => {
    //   // console.log(Object.keys(chunk))
    //   console.log(chunk.modules)
    // })
    // })
  })

  // compiler.plugin('emit', (compilation, callback) => {
  // var assets = compilation.assets;
  // console.log(Object.keys(assets))
  // })
};

module.exports = WeexDowngradePlugin;