import fs from 'fs'

export function indent (code) {
  return code.replace(/\n/g, '\n  ')
}

export function readCodesSync (filePath = './downgrade.js') {
  try {
    const code = fs.readFileSync(filePath, 'utf8')
    return indent(code)
  } catch(e) {
    console.log('Error:', e.stack)
    return '/* invalid downgrade code */'
  }
}
