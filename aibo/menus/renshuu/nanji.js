/*
  ima nan ji desu ka

  after writing the above, we must have a question that asks what the exact time
  is at that very moment otherwise this class is incomplete.
*/
const util = require('../../lib/util.js')
const chalk = require('chalk')
const nodeUtil = require('util')
const EventEmitter = require('events').EventEmitter

let _self
function log(level, message) { _self.emit("log",{module:'nanji',level,message})}

// TODO: implement the google record, play and google cloud integration code

class NanjiMenu {
  constructor(menuStack, render) {
    _self = this
    this.name = 'Nan Ji'
    this.menuStack = menuStack
    this.render = render

    this.currentRow = 0
    this.selectedOption = null

    this.menu = {}
    this.logStream = []
  }
  init(params) {
    console.log('inside of nanji test invocation!', params)
    process.exit(0)
  }
  onKeypress(str, key) {
    if (key.name === 'escape') process.exit(0)
    this.navigate(key)
  }
  navigate(key) {
    if (key.name === 'up') {}
    if (key.name === 'down') {}
    // will probably need left and right for tests
    //if (key.name === 'left') {}
    //if (key.name === 'right') {}
    if (key.name === 'return') {}
    if (key.name === 'backspace') {}
    if (key.name === 'space') {}
    this.draw()
  }
  draw() {}
  reset() {}
}
nodeUtil.inherits(NanjiMenu, EventEmitter)

module.exports = NanjiMenu
