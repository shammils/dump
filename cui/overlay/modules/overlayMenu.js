const chalk = require('chalk')
const nodeUtil = require('util')
const EventEmitter = require('events').EventEmitter
const util = require('../lib/util.js')

let _self
function log(level, message) { _self.emit("log",{module:'OverlayMenu',level,message})}

class OverlayMenu {
  constructor(updateState, updateStack, ViewBuilder) {
    _self = this
    this.name = 'Basically a Pause Menu'
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
          name: 'Help',
          type: util.menuItemTypes.function,
          handler: () => {
            console.log('instructions go here')
            process.exit(0)
          }
        },
        {
          name: 'Settings',
          type: util.menuItemTypes.function,
          handler: () => {
            console.log('nothing here')
            process.exit(0)
          },
        },
        {
          name: 'Kakeru',
          type: util.menuItemTypes.function,
          handler: () => {
            console.log('interfacing directly with Yonde goes here')
            process.exit(0)
          }
        },
        {
          name: 'Shaberu',
          type: util.menuItemTypes.function,
          handler: () => {
            console.log('interfacing directly with Yonde with STT goes here.. I think. Global aibo makes this obsolete')
            process.exit(0)
          }
        },
        {
          name: 'Quit',
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
    // how about if we press the space bar, we start recording voice?? command
    // mode of course
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
nodeUtil.inherits(OverlayMenu, EventEmitter)

module.exports = OverlayMenu
