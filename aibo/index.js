const menuStack = []
const render = () => {
  menuStack[menuStack.length-1].draw()
}
const CoreMenu = require('./menus/core.js')
const coreMenu = new CoreMenu(menuStack, render)

process.stdin.on('keypress', (str, key) => {
  menuStack[menuStack.length-1].onKeypress(str, key)
})

;(async () => {
  coreMenu.stack.push(coreMenu.menu)
  menuStack.push(coreMenu)
  render()
})()
