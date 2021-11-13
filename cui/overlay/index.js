/*
  How about this file implements onKeypress, draw, and.... doesnt make sense forget it
  I am sure we will need a reducer

  TODO: add a 'view legend' option that explains what each icon means. I want to
  add an overlay menu and this would probably be a good item for it.
*/
const MainMenu = require('./modules/mainMenu.js')
const OverlayMenu = require('./modules/overlayMenu.js')
const Logger = require('./lib/logger.js')
// todo: put in its own file so we can do logging

const logger = new Logger()
function onLog(moduleName, level, message) {
  logger.log(moduleName, level, message)
  /*switch (log.level) {
    case 'debug': { } break
    case 'info': { console.log(`${new Date().toISOString()}: ${log.message}`) } break
    case 'warn': { console.log(chalk.yellow(`${new Date().toISOString()}: ${log.message}`)) } break
    case 'error': { console.log(chalk.red(`${new Date().toISOString()}: ${log.message}`)) } break
    default:
      throw `unsupported log level ${log.level}`
  }*/
}


const chalk = require('chalk')
const readline = require('readline')
readline.emitKeypressEvents(process.stdin)

if (process.stdin.isTTY) { process.stdin.setRawMode(true) }

process.stdin.on('keypress', (str, key) => {
  if (key.name === 'c' && key.ctrl) process.exit(0)
  if (key.name === 'escape') {
    // enter overlay mode. my ipega controller uses this key for one of its buttons
    // so we need to watch for 'game' mode
    if (state.interactionTarget === 'applicationModules') {
      // ???
      state.interactionTarget = 'overlayModules'
    } else {
      // ???
      state.interactionTarget = 'applicationModules'
    }
  }
  // at the moment we probably want to only override CTRL + c and 'escape', so
  // pass the key to the currently loaded module
  state[state.interactionTarget][state[state.interactionTarget].length-1].onKeypress(str, key)
});
process.stdout.on('resize', () => {
  //console.log(`screen size: ${process.stdout.columns}x${process.stdout.rows}`)
  updateState('dimensions', {
    columns: process.stdout.columns,
    rows: process.stdout.rows,
  })
})
// do not expose the state object to anyone, only the updateState method
const state = {
  applicationModules: [],
  overlayModules: [],
  interactionTarget: 'applicationModules', // 'overlay', 'application'
  dimensions: {
    columns: process.stdout.columns,
    rows: process.stdout.rows,
  },
  speakOn: true,
  recording: false,
  mode: 'navigate',
  location: 'home',
}

;(async () => {
  // how about we call the .init function on every class after instantiating it?
  // its better than assuming .draw is the right one or something else.
  // TODO: logging
  const mainMenu = new MainMenu(updateState, updateStack, onLog)
  // this pattern doesnt make too much sense in this infrastructure tbqh. I want
  // something different.
  //mainMenu.on('log', onLog)
  state.applicationModules.push(mainMenu)
  const overlayMenu = new OverlayMenu(updateState, updateStack, onLog)
  //overlayMenu.on('log', onLog)
  state.overlayModules.push(overlayMenu)
  mainMenu.draw()
})()
// probably move the state stuff to its own file, like stateManager.js
function updateStack(task, item) {
  switch(task) {
    case 'add': { state.applicationModules.push(item) } break
    case 'remove': { state.applicationModules.pop() } break
    case 'modify': {
      state.applicationModules[state.applicationModules.length-1] = item
    } break
    default: {
      console.log(`task '${task}' unsupported. we only support 'add', 'remove' and 'modify'`)
      process.exit()
    }
  }
  // for now, lets leave it up to the caller to call render
  //render()
}
function getStatePropertyValue(property) {
  if (!property || !property.length || typeof property !== 'string') {
    console.log(`invalid property '${property}'`)
    process.exit()
  }
  if (property === 'stack') {
    console.log('do not directly access this property')
    process.exit()
  }
  // always return a new object to the caller
  if (Array.isArray(state[property])) return [...state[property]]
  else if (typeof state[property] === 'object') return {...state[property]}
  else {
    // hmmmm. unless its a function, the caller should not be able to modify the
    // state from this returned variable??? lets hope not
    // TODO: verify the above statement
    return state[property]
  }
}
function updateState(property, value) {
  if (!property || !property.length || typeof property !== 'string') {
    console.log(`invalid property '${property}'`)
    process.exit()
  }
  if (property === 'stack') {
    console.log('use the updateStack function')
    process.exit()
  }
  state[property] = value
  render()
}

// LOL this code belongs in the ViewBuilder
// any time an event occurs where the screen should update should pipe to this
// method.
// the idea is that this method will always build the overlay and potentially
// build whatever the current interface is requesting.
function render() {
  onLog('index', 'debug', 'rendering')
  if (state[state.interactionTarget][state[state.interactionTarget].length-1].name === 'Rooty Tooty Shooty Kabooty' &&
  state[state.interactionTarget][state[state.interactionTarget].length-1].state === 'playing') {
    console.log(state.currentView.rows)
    process.exit()
  }
  /*
  we have to handle line breaks properly if we want to be able to infinite
  scroll/page when the view's height is more than the device's height.
  for the time being, the overlay takes two rows:
    - one row for the icons
    - one row as a delimiter
  I am considering a row for description or something but for now forget it.

  If screen height isnt at least n, throw error, forget even trying to handle it.
  */
  // always render the overlay here.
  let text = createOverlay()
  // if the current menu has its own draw/buildInterface function, call it. We
  // cannot handle every possible interface here

  state.currentView.rows.forEach(r => {
    if (r.type === 'static') {
      // apply styles
      if (r.style) {
        if (r.style === 'bold') { text += `${chalk.bold(r.value)}\n` }
        if (r.style === 'breadcrumb') { text += `${chalk.cyan.bold(r.value)}\n` }
        if (r.style === 'error') { text += `${chalk.red.bold(r.value)}\n` }
      } else {
        text += `${r.value}\n`
      }
    }
    if (r.type === 'list') {
      r.options.forEach(el => {
        let value = ''
        if (el.value != null) {
          // do decoration for value types at some point.
          value = ` - '${el.value}'`
        }
        if (el.selected) text += chalk.underline.bold(`> ${el.name}${value}\n`)
        else text += `  ${el.name}${value}\n`
      })
    }
    if (r.type === 'menu') {
      r.options.forEach(el => {
        if (el.selected) text += chalk.underline.bold(`> ${el.name}\n`)
        else text += `  ${el.name}\n`
      })
    }
    if (r.type === 'raw') {
      // module rendered everything
      text += r.text
    }
  })
  print(text)
}
function print(text) {
  console.clear()
  readline.clearLine(process.stdout, 0)
  readline.cursorTo(process.stdout, 0)
  process.stdout.write(text)
}
function createOverlay() {
  onLog('index', 'debug', 'creating overlay')
  let text = ''
  let iconArr = []
  let delimiter = Array(state.dimensions.columns).fill('_').join('')
  // for now lets assume each icon is 3 characters(space front,end and char itself)
  // since chalk adds to the string length but not the length rendered in console

  // fuck it, I know the length is supposed to be 17 with 2 utf8 and 2 emoji, update
  // later
  const iconStringLength = 17
  if (state.speakOn) iconArr.push(chalk.green(' 🗣 '))
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
