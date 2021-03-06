const fs = require('fs-extra')

const readline = require('readline')
readline.emitKeypressEvents(process.stdin)
if (process.stdin.isTTY) { process.stdin.setRawMode(true) }

// termux と linux, それ だけ だ. まど は ぜんぜん しらないん です けど ね
const usingTermux = process.env.SHELL.includes('com.termux')

const api = {
  usingTermux,
  modes: {
    navigate: 'navigate',
    multiSelect: 'multi-select',
    input: 'input',
  },
  menuItemTypes: {
    function: 'function',
    select: 'select',
    menu: 'menu',
    multiSelect: 'multi-select',
    boolean: 'boolean',
    input: 'input',
  },
  dataTypes: {
    function: 'function',
    text: 'text',
    number: 'number',
    boolean: 'boolean',
    float: 'float',
    integer: 'integer',
  },
  print: (text) => {
    console.clear()
    readline.clearLine(process.stdout, 0)
    readline.cursorTo(process.stdout, 0)
    process.stdout.write(text)
  },
  delay: ms =>
  new Promise(resolve =>
    setTimeout(() => resolve(), ms)),
  trim: (string, maxLength, prependThingy) => {
    if (!string || !string.length) return string
    if (string.length < maxLength) return string
    else {
      if (prependThingy) return `${string.substring(0, maxLength-4)}...`
      else return string.substring(0, maxLength)
    }
  },
  createBreadcrumbs: (menuStack, maxLength) => {
    // dont bother creating crumbs if we are at the top level
    if (!menuStack || !menuStack.length || menuStack.length === 1) return
    let crumbArr = []
    for (let i = 0; i < menuStack.length; i++) {
       crumbArr.push(menuStack[i].name)
    }
    let crumbs = crumbArr.join(' > ')
    if (maxLength && crumbs.length > maxLength) {
      // truncate from the front
      crumbs = `...${crumbs.substring(crumbs.length-maxLength, crumbs.length-1)}`
    }
    return crumbs
  },
}

module.exports = api
