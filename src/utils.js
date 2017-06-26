import fs from 'fs'
import jsonFormat from 'json-format'

export function indent (code, len = 2) {
  const space = (new Array(len + 1)).join(' ')
  return space + code.replace(/\n/g, '\n' + space)
}

export function readCodesSync (filePath = './downgrade.js') {
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
  return `Downgrade.condition(\n${indent(params)}\n);\n`
}


export function generateDowngradeCode (options) {
  const condition = options.condition || defaultCondition
  return '// TODO: generate downgrade codes here' +
`
;(function(){
  /* npm downgrade nodule */
${indent(readCodesSync())}

  /* downgrade config */
${indent(generateConditionCode(condition))}

})();

`
}
