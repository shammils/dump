const BaseModule = require('./base.js')

class MainMenuModule extends BaseModule {
  constructor(iState, onLog) {
    super(iState, onLog)
    this.iState = iState
    this.log = (level, message) => { this.onLog('main', level, message) }
  }
  onKeypress(str, key) {
    super.onKeypress(str, key)
    this.navigate(key)
  }
  navigate(key) {
    this.draw()
  }
  draw() {
    super.render()
  }
}

module.exports = MainMenuModule
