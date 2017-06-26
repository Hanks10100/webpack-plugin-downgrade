import fs from 'fs'
import path from 'path'
import jsonFormat from 'json-format'

const defaultFilePath = path.join(__dirname, './downgrade.js')

export function indent (code, len = 2) {
  const space = (new Array(len + 1)).join(' ')
  return space + code.replace(/\n/g, '\n' + space)
}

export function readCodesSync (filePath = defaultFilePath) {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch(e) {
    console.log('Error:', e.stack)
    return '/* invalid downgrade code */'
  }
}

export function generateConditionCode (condition) {
  const params = jsonFormat(condition, {
    type: 'space',
    size: 2
  })
  return `WeexDowngrade.condition(\n${indent(params)}\n);\n`
}


export function generateDowngradeCode (options) {
  const condition = options.condition || defaultCondition
  return '/* Weex downgrade configs */' +
`
;(function(){
  /* npm downgrade nodule */
${indent(readCodesSync())}

  /* downgrade condition */
${indent(generateConditionCode(condition))}
})();

`
}
