const CoreMenu = require('./menus/core.js')
const coreMenu = new CoreMenu()
const TranslateMenu = require('./menus/translate.js')
const translateMenu = new TranslateMenu()

process.stdin.on('keypress', (str, key) => {
  if (key.name === 'escape') process.exit(0)
  coreMenu.navigate(key)
})

;(async () => {
  coreMenu.stack.push(coreMenu.menu)
  coreMenu.draw()
})()
