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
    // not sure why we would ever need a super for this function just yet
    //super.navigate()
    this.draw()
  }
  draw() {
    super.draw() // this clears the view. might do more in the future
    this.view.push({  })
    process.exit(0)
    super.render()
  }
}

module.exports = MainMenuModule
