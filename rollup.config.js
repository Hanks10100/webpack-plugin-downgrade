import buble from 'rollup-plugin-buble'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'

export default {
  entry: 'index.es6.js',
  format: 'cjs',
  dest: 'index.js',
  external: ['crypto', 'webpack', 'webpack-sources'],
  plugins: [
    nodeResolve({ jsnext: true, main: true }),
    commonjs(),
    buble({ transforms: { forOf: false } })
  ]
};
