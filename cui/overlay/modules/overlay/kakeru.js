const chalk = require('chalk')
const util = require('../lib/util.js')
const ViewBuilder = require('../../lib/viewBuilder.js')

class KakeruMenu {
  constructor(updateState, updateStack, onLog) {
    _self = this
    this.name = 'Kakeru'
    this.updateState = updateState
    this.updateStack = updateStack
    this.onLog = onLog
    this.input = []
  }
  onKeypress(str, key) {
    // handle alphanumeric
    if (key.name && key.name.length === 1) input.push(key.sequence)
    // handle special chars
    if (!key.name && key.sequence.length === 1) input.push(key.sequence)
    // backspace
    if (key.name === 'backspace') input.pop()
    if (key.name === 'space') input.push(' ')
    //this.navigate(key)
    this.draw()
  }
  //navigate(key) { }
  draw() {
    const vb = new ViewBuilder('list')

    this.updateState('currentView', vb)
  }
}
nodeUtil.inherits(KakeruMenu, EventEmitter)

module.exports = KakeruMenu
