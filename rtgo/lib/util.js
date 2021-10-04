const klaw = require('klaw')
const path = require('path')
const fs = require('fs-extra')
const through2 = require('through2')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const api = {
  fetchInfoFileDirs: (productDir) => {
    return new Promise((resolve, reject) => {
      const items = []
      klaw(productDir)
      .pipe(through2.obj(function (item, enc, next) {
        if (!item.stats.isDirectory()) this.push(item)
        next()
      }))
      .on('data', item => {
        const fileObj = path.parse(item.path)
        if (fileObj.base === 'info.json') items.push(item.path)
      })
      .on('end', () => resolve(items))
    })
  },
  askQuestion: q => {
    return new Promise(resolve => {
      rl.question(q, (answer) => {
        resolve(answer)
      })
    })
  },
  windowsifyString: (text) => {
    if (!text) return text
    return text.replace(/[<>:"\/\\|?*]+/g, '')
  },
  skuwerString: (text) => {
    if (!text) return text
    const found = text.match(/[A-Za-z\d]/g)
    if (found && found.length) {
      return found.join('').toUpperCase()
    }
    return text
  },
  parseLink: (string) => {
    // I rather it throw in this case
    if (string.includes(', ')) string = string.split(', ')[1]
    const val = string.match(/(?<=\<)(.*?)(?=\>)/g)
    if (val && val.length) return val[0]
  },
  delay: ms =>
    new Promise(resolve =>
      setTimeout(() => resolve(), ms)),
}

module.exports = api
