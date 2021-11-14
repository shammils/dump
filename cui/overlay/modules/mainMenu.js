const chalk = require('chalk')
const nodeUtil = require('util')
const EventEmitter = require('events').EventEmitter
const util = require('../lib/util.js')
const RTSK = require('./rootyTootyShootyKabooty.js')
const ViewBuilder = require('../lib/viewBuilder.js')
const SettingsMenu = require('./settings.js')
const KotobaTest = require('./tests/kotoba.js')
const Kakeru = require('./kakeru.js')

let _self
//function log(level, message) { _self.emit("log",{module:'mainMenu',level,message})}

class MainMenu {
  constructor(updateState, updateStack, onLog) {
    _self = this
    this.name = 'Main'
    // saving this copy to pass to children
    this.onLog = onLog
    // using the saved copy
    this.log = (level, message) => { this.onLog('main', level, message) }
    // functions to manipulate state & view
    this.updateState = updateState
    this.updateStack = updateStack

    this.currentRow = 0
    this.stack = []
    //this.mode
    this.options = {
      name: this.name,
      type: 'menu',
      options: [
        {
          name: 'RTSK',
          type: util.menuItemTypes.function,
          handler: () => {
            const rootinTootin = new RTSK(this.updateState, this.updateStack, this.onLog)
            updateStack('add', rootinTootin)
            setTimeout(() => {rootinTootin.draw()}, 10)
            /*
              shit fuck, lost a bit of time on this one
              not working LOC
                setTimeout(rootinTootin.draw, 10)
              working LOC
                setTimeout(() => {rootinTootin.draw()}, 10)

              the class's construtor objects are all missing on that first LOC,
              yet the draw() event was present
            */
          },
        },
        {
          name: 'Translate',
          type: util.menuItemTypes.function,
          handler: () => {
            console.log('nothing here')
            process.exit(0)
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
                console.log('nothing here')
                process.exit(0)
              },
            },
            {
              name: 'Kotoba',
              type: util.menuItemTypes.function,
              handler: () => {
                const settingsMenu = new SettingsMenu(
                  this.updateState,
                  this.updateStack,
                  this.onLog,
                  util.menuConfiguration['kotoba'],
                  {
                    name: chalk.green.bold('Start Test ->'),
                    type: util.menuItemTypes.function,
                    handler: (params) => {
                      this.updateStack('remove') // remove the settings menu
                      const kotoba = new KotobaTest(this.updateState, this.updateStack, onLog, params)
                      this.updateStack('add', kotoba) // add the test module
                      setTimeout(() => {kotoba.draw()}, 10)
                    }
                  },
                  {
                    name: chalk.red.bold(' <- Cancel'),
                    type: util.menuItemTypes.function,
                    handler: () => {
                      this.updateStack('remove')
                      setTimeout(() => {this.draw()}, 10)
                    }
                  }
                )
                // add settings menu to the stack
                this.updateStack('add', settingsMenu)
                setTimeout(() => {settingsMenu.draw()}, 10)
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
          name: 'Kakeru',
          type: util.menuItemTypes.function,
          handler: () => {
            const kakeru = new Kakeru(this.updateState, this.updateStack, onLog)
            this.updateStack('add', kakeru)
            setTimeout(() => {kakeru.draw()}, 10)
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
    this.log('debug', `key hit: ${key.name}`)
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
    const vb = new ViewBuilder('list')
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
