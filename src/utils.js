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
    const code = fs.readFileSync(filePath, 'utf8')
    return '/* npm downgrade module */\n' + code
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
  return `/* downgrade condition */\n` +
    `WeexDowngrade.condition(\n${indent(params)}\n);`
}


export function generateDowngradeCode (options) {
  const condition = options.condition || defaultCondition
  // TODO: check condition format
  return '\n/* Weex downgrade configs */\n' +
    ';(function(){\n' +
      indent(readCodesSync(defaultFilePath)) + '\n\n' +
      indent(generateConditionCode(condition)) + '\n' +
    '})();\n\n'
}
