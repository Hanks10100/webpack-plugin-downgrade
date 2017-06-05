import Downgrade from '@weex-project/downgrade'
import { ConcatSource } from 'webpack-sources'

const defaultCondition = {

}

function generateDowngradeCode (options) {
  const condition = options.condition || defaultCondition
  return '// TODO: generate downgrade codes here\n'
}

export default class WeexDowngradePlugin {
  constructor (options) {
    this.options = options || {}
  }

  apply (compiler) {
    const code = generateDowngradeCode(this.options)

    compiler.plugin('compilation', (compilation) => {
      compilation.plugin('optimize-chunk-assets', (chunks, callback) => {
        chunks.forEach((chunk) => {
          if ('isInitial' in chunk && !chunk.isInitial()) return;

          chunk.files.forEach(file =>
            compilation.assets[file] = new ConcatSource(
              code.replace(/\[filename\]/g, file), '\n', compilation.assets[file]
            )
          )
        })
        callback()
      })
    })
  }
}
