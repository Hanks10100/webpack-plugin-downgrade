import fs from 'fs'

export function indent (codes) {
  return codes.replace(/\n/g, '\n  ')
}

export function readCodesSync (filePath = './downgrade.js') {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch(e) {
    console.log('Error:', e.stack)
    return '/* invalid downgrade code */'
  }
}
