// webpack.config.js
var path = require('path')
var UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  entry: './index.es6.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname)
  },
  module: {
    loaders: [
      {
        test: /.js$/,
        loaders: 'buble-loader',
        include: path.resolve(__dirname),
        query: {
          objectAssign: 'Object.assign'
        }
      }
    ]
  },
  plugins: [
    // new UglifyJSPlugin()
  ]
};
