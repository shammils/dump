const util = require('../../lib/util.js')
const chalk = require('chalk')
const ViewBuilder = require('../../lib/viewBuilder.js')

class KotobaTest {
  constructor(updateState, updateStack, onLog, params) {
    // these constructor vars can be moved to a base class at this point.
    // TODO: move things every class uses(logs) to base class
    this.name = 'Kotoba'
    this.onLog = onLog
    this.log = (level, message) => { this.onLog('kotoba', level, message) }
    this.updateState = updateState
    this.updateStack = updateStack
  }
  onKeypress(str, key) {
    this.navigate(key)
  }
  navigate(key) {
    if (key.name === 'up') {}
    if (key.name === 'down') {}
    if (key.name === 'return') {}
    if (key.name === 'backspace') {}
    if (key.name === 'space') {}

    this.draw()
  }
  draw() {
    const vb = new ViewBuilder('list')

    this.updateState('currentView', vb)
  }
  reset() {}
}

function getData() {
  return {

  }
}
module.exports = KotobaTest
