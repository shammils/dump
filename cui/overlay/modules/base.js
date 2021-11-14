
class BaseModule {
  constructor(updateState, updateStack, onLog) {
    this.name = 'Base'
    this.onLog = onLog
    //this.log = (level, message) => { this.onLog('main', level, message) }
    this.updateState = updateState
    this.updateStack = updateStack
  }
  onKeypress(str, key) {
    // could I put the global escape code here?? I think thats a better option
    // since I could overload it when needed instead of escape always behaving
    // how index.js says it should
    this.navigate(key)
  }
  navigate(key) {
    this.draw()
  }
  draw() {}
}

module.exports = BaseModule
