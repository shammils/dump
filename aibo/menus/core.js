const util = require('../lib/util.js')
const chalk = require('chalk')
const nodeUtil = require('util')
const EventEmitter = require('events').EventEmitter

const TranslateMenu = require('./translate.js')

let _self
function log(level, message) { _self.emit("log",{module:'core',level,message})}

class CoreMenu {
  constructor(menuStack, render) {
    _self = this
    this.name = 'Main'
    this.menuStack = menuStack
    this.render = render

    this.currentRow = 0
    this.stack = []
    this.mode = util.modes.navigate
  }
  menu = {
    type: 'menu',
    options: [
      {
        name: 'Translate',
        type: util.menuItemTypes.function,
        handler: () => {
          const translateMenu = new TranslateMenu(this.menuStack, this.render)
          this.menuStack.push(translateMenu)
          // HACK: put the render call in a setTimeout function to allow the
          // processing loop to draw core's view first, then the intended translate
          // view after. Trying to draw translate's view without the setTimeout
          // fails with core's view rendered on top.
          setTimeout(() => {this.render()}, 10)
        },
      },
      {
        name: 'Benkyou',
        type: util.menuItemTypes.menu,
        options: [
          {
            name: 'Kotoba Renshuu',
            type: util.menuItemTypes.function,
            handler: () => {
              console.log('nothing here')
              process.exit(0)
            },
          }
        ]
      },
      {
        name: 'Text Mode',
        type: util.menuItemTypes.function,
        handler: () => {
          console.log('interfacing directly with Yonde goes here')
          process.exit(0)
        }
      },
      {
        name: 'Voice Mode',
        type: util.menuItemTypes.function,
        handler: () => {
          console.log('nothing here')
          process.exit(0)
        }
      },
      {
        name: 'Interface Testing',
        type: util.menuItemTypes.menu,
        handler: () => {
          console.log('nothing here')
          process.exit(0)
        }
      },
    ]
  }
  /*
    Typically what happens when a user submits a keystroke
  */
  navigate(key) {
    const menuItem = this.stack[this.stack.length-1]
    const current = menuItem.options[this.currentRow]
    if (key.name === 'up') {
      if (this.currentRow > 0) {
        this.currentRow -= 1
      }
    }
    if (key.name === 'down') {
      if (this.currentRow < menuItem.options.length-1) {
        this.currentRow += 1
      }
    }
    if (key.name === 'return') {
      if (this.mode === util.modes.multiSelect) {
        this.mode = util.modes.navigate
        this.stack.pop()
        this.currentRow = 0
      } else {
        switch(current.type) {
          case util.menuItemTypes.function: {
            current.handler() // await?
          } break
          case util.menuItemTypes.select: {
            this.stack.push(current)
          } break
          case util.menuItemTypes.menu: {
            this.stack.push(current)
          } break
          case util.menuItemTypes.multiSelect: {
            this.mode = util.modes.multiSelect
            this.currentRow = 0
            this.stack.push(current)
          } break
        }
      }
    }
    if (key.name === 'backspace') {
      if (this.stack.length > 1) {
        this.mode = util.modes.navigate
        this.stack.pop()
        this.currentRow = 0
      }
    }
    if (key.name === 'space') {
      if (menuItem.type === util.menuItemTypes.multiSelect) {
        menuItem.options[currentRow].selected = !menuItem.options[currentRow].selected
      }
    }

    this.draw()
  }
  /*
    Creating the view that the user sees on screen
  */
  draw() {
    let text = ''
    // render breadcrumbs
    if (this.stack.length > 1) {
      const crumbArr = []
      for (let i = 1; i < this.stack.length; i++) {
        crumbArr.push(util.trim(this.stack[i].name, 20, true))
      }
      text += `${chalk.cyan.bold(crumbArr.join(' > '))}\n`
    } else {
      text += chalk.cyan.bold(`${this.name}\n`)
    }
    // render rest of shit
    const current = this.stack[this.stack.length-1]
    if (current.type === util.menuItemTypes.menu) {
      for (let i = 0; i < current.options.length; i++) {
        if (this.currentRow === i) {
          text += chalk.underline.bold(`> ${current.options[i].name}\n`)
        } else {
          text += `  ${current.options[i].name}\n`
        }
      }
    }
    if (current.type === util.menuItemTypes.multiSelect) {
      text += `> ${chalk.green(current.name)}\n`
      for (let i = 0; i < current.options.length; i++) {
        const selected = current.options[i].selected ? '•' : '◦'
        if (this.currentRow === i) {
          text += chalk.underline.bold(` > ${selected} ${current.options[i].name}\n`)
        } else {
          text += ` > ${selected} ${current.options[i].name}\n`
        }
      }
    }
    // TODO: support input?
    util.print(text)
  }
  /*
    Performing whatever steps are required to bring the navigation to... the top?
  */
  reset() {
    this.mode = util.modes.navigate
    this.stack.length = 1
    this.currentRow = 0
  }
}
nodeUtil.inherits(CoreMenu, EventEmitter)

module.exports = CoreMenu
