const chalk = require('chalk')
const nodeUtil = require('util')
const EventEmitter = require('events').EventEmitter
const util = require('../lib/util.js')

let _self
function log(level, message) { _self.emit("log",{module:'mainMenu',level,message})}

class MainMenu {
  constructor(updateState, updateStack, ViewBuilder) {
    _self = this
    this.name = 'Main'
    // functions to manipulate state & view
    this.updateState = updateState
    this.updateStack = updateStack
    this.ViewBuilder = ViewBuilder

    this.currentRow = 0
    this.stack = []
    //this.mode
    this.options = {
      name: this.name,
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
          name: 'Renshuu',
          type: util.menuItemTypes.menu,
          options: [
            {
              name: 'Nan Ji',
              type: util.menuItemTypes.function,
              handler: () => {
                const settingsMenu = new SettingsMenu(
                  this.menuStack,
                  helper.menuConfiguration['Nan Ji'],
                  {
                    name: 'Start Test',
                    type: util.menuItemTypes.function,
                    handler: (params) => {
                      const nanji = new NanjiMenu(this.menuStack, this.render, params)
                      this.menuStack.push(nanji)
                      nanji.init()
                    }
                  },
                  {
                    name: 'Cancel',
                    type: util.menuItemTypes.function,
                    handler: () => {
                      this.menuStack.pop()
                      setTimeout(() => {this.render()}, 10)
                    }
                  }
                )
                // add settings menu to the stack
                this.menuStack.push(settingsMenu)
                setTimeout(() => {this.render()}, 10)
              },
            },
            {
              name: 'Kotoba',
              type: util.menuItemTypes.function,
              handler: () => {
                console.log('nothing here')
                process.exit(0)
              },
            },
            {
              name: 'Kanji',
              type: util.menuItemTypes.function,
              handler: () => {
                console.log('nothing here')
                process.exit(0)
              },
            },
            {
              name: 'Kana',
              type: util.menuItemTypes.function,
              handler: () => {
                console.log('nothing here')
                process.exit(0)
              },
            },
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
            console.log('interfacing directly with Yonde with STT goes here.. I think. Global aibo makes this obsolete')
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
    this.stack.push(this.options)
  }
  onKeypress(str, key) {
    this.navigate(key)
  }
  // TODO: R&D if its possible to move menu navigation to the parent.
  navigate(key) {
    log('debug', `key hit: ${key.name}`)
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
      switch(current.type) {
        case util.menuItemTypes.function: {
          current.handler() // await?
        } break
        case util.menuItemTypes.select: {
          this.stack.push(current)
        } break
        case util.menuItemTypes.menu: {
          this.stack.push(current)
          this.currentRow = 0
        } break
        case util.menuItemTypes.multiSelect: {
          this.mode = util.modes.multiSelect
          this.currentRow = 0
          this.stack.push(current)
        } break
      }
    }
    if (key.name === 'backspace') {
      if (this.stack.length > 1) {
        // changing modes might not always be the right choice when clicking back
        // but I cant think of any issues atm
        this.mode = util.modes.navigate
        // remove the last menu item from the stack
        this.stack.pop()
        // TODO: remember the last currentRow value so the user isnt back to the
        // top of the previous menu
        this.currentRow = 0
      }
    }
    this.draw()
  }
  // every module is responsible for building its own view, the global object is
  // responsible for rendering the built view to the screen
  draw() {
    const vb = new this.ViewBuilder('list')
    // how about we modify this.view in this class and then call the global
    // render function? for now im going to update the state this way, not sure
    // which one is better

    // build breadcrumbs
    vb.append({
      type: 'static',
      style: 'breadcrumb',
      value: util.createBreadcrumbs(this.stack, 100),
    })
    const current = this.stack[this.stack.length-1]
    if (current.type === util.menuItemTypes.menu) {
      const menu = { type:'menu', options:[]}
      for (let i = 0; i < current.options.length; i++) {
        menu.options.push({
          name: current.options[i].name,
          selected: this.currentRow === i,
        })
      }
      vb.append(menu)
    }
    this.updateState('currentView', vb)
  }
}
nodeUtil.inherits(MainMenu, EventEmitter)

module.exports = MainMenu