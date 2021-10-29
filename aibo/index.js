const CoreMenu = require('./menus/core.js')
const coreMenu = new CoreMenu()

process.stdin.on('keypress', (str, key) => {
  if (key.name === 'escape') process.exit(0)
  coreMenu.navigate(key)
})

;(async () => {
  coreMenu.stack.push(coreMenu.menu)
  coreMenu.draw()
})()
