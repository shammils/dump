
class BaseModule {
  view
  #state
  constructor(iState, onLog) {
    this.si = iState
    this.onLog = onLog
    this.log = (level, message) => { this.onLog('base', level, message) }
  }
  // get the name array for breadcrumbs
  get stackNameArray() {
    return this.#state[this.#state.interactionTarget].map(m => m.name)
  }
  onKeypress(str, key) {
    // could I put the global escape code here?? I think thats a better option
    // since I could overload it when needed instead of escape always behaving
    // how index.js says it should
    if (key.name === 'c' && key.ctrl) process.exit(0)
    if (key.name === 'escape') {
      // enter overlay mode. my ipega controller uses this key for one of its buttons
      // so we need to watch for 'game' mode
      if (this.#state.interactionTarget === 'applicationModules') {
        // ???
        this.#state.interactionTarget = 'overlayModules'
      } else {
        // ???
        this.#state.interactionTarget = 'applicationModules'
      }
    }
  }
  createOverlay() {
    this.log('debug', 'creating overlay')
    console.log(this.iState.get('speakOn'))
    console.log(this.iState.get('mode'))
    process.exit(0)
    let text = ''
    let iconArr = []
    let delimiter = Array(process.stdout.columns).fill('_').join('')
    // for now lets assume each icon is 3 characters(space front,end and char itself)
    // since chalk adds to the string length but not the length rendered in console

    // fuck it, I know the length is supposed to be 17 with 2 utf8 and 2 emoji, update
    // later
    const iconStringLength = 17
    if (this.iState.get('speakOn')) iconArr.push(chalk.green(' 🗣 '))
    else iconArr.push(' 🔇 ')
    if (state.recording) iconArr.push(chalk.red(' ● '))
    else iconArr.push(' ● ')
    switch(state.mode) {
      case 'navigate': { iconArr.push(' 🔃 ') } break
      case 'input': { iconArr.push(' 🔤 ') } break
      case 'game': { iconArr.push(' 🎮 ') } break
      default: { console.log(`mode '${overlay.mode}' unsupported`);process.exit() } break
    }
    if (state.interactionTarget === 'overlayModules') {
      iconArr.push(' 🔒 ')
    } else {
      // applicationModules is the only other option atm
      switch(state.location) {
        case 'home': { iconArr.push(' 🏠 ') } break
        case 'benkyou': { iconArr.push(' 🈴 ') } break
        case 'settings': { iconArr.push(' 🛠 ') } break
        case 'game': { iconArr.push(' 🆚 ') } break
        default: { console.log(`mode '${overlay.mode}' unsupported`);process.exit() } break
      }
    }
    text += `${iconArr.join(' ')}\n`
    text += `${delimiter}\n`
    return text
  }
  render() {
    const overlay = this.createOverlay()
    console.clear()
    process.stdout.write(text)
  }
}

module.exports = BaseModule
