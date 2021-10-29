const menuStack = []
const render = () => {
  menuStack[menuStack.length-1].draw()
}
const CoreMenu = require('./menus/core.js')
const coreMenu = new CoreMenu(menuStack, render)

process.stdin.on('keypress', (str, key) => {
  if (key.name === 'escape') {
    // how about if we arent on the main menu, have it move up the stack. if we
    // are at the top, exit the program
    if (menuStack.length > 1) {
      menuStack.pop()
      render()
    } else {
      process.exit(0)
    }
  }
  menuStack[menuStack.length-1].navigate(key)
})

;(async () => {
  coreMenu.stack.push(coreMenu.menu)
  menuStack.push(coreMenu)
  render()
})()
