import buble from 'rollup-plugin-buble'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'

export default {
  moduleName: 'WeexDowngrade',
  entry: 'src/downgrade.js',
  format: 'umd',
  dest: 'packages/downgrade/index.js',
  plugins: [
    nodeResolve({ jsnext: true, main: true }),
    commonjs(),
    buble({ transforms: { forOf: false } })
  ]
};
