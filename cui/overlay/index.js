/*
  How about this file implements onKeypress, draw, and.... doesnt make sense forget it
  I am sure we will need a reducer

  TODO: add a 'view legend' option that explains what each icon means. I want to
  add an overlay menu and this would probably be a good item for it.
*/
const chalk = require('chalk')
const readline = require('readline')
readline.emitKeypressEvents(process.stdin)

if (process.stdin.isTTY) { process.stdin.setRawMode(true) }

process.stdin.on('keypress', (str, key) => {
  if (key.name === 'c' && key.ctrl) process.exit(0)
  if (key.name === 'escape') {
    // enter overlay mode. my ipega controller uses this key for one of its buttons
    // so we need to watch for 'game' mode
  }
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
  stack: [],
  interactionTarget: 'application', // 'overlay', 'application'
  dimensions: {
    columns: process.stdout.columns,
    rows: process.stdout.rows,
  },
  overlay: {
    playing: false,
    recording: false,
    mode: 'navigate',
    location: 'home',
  }
}
;(async () => {
  // how about we call the .init function on every class after instantiating it?
  // its better than assuming .draw is the right one or something else.
  render()
})()
// probably move the state stuff to its own file, like stateManager.js
function updateStack(task, item) {
  switch(task) {
    case 'add': { state.stack.push(item) }
    case 'remove': { state.stack.pop() }
    case 'modify': { state.stack[state.stack.length-1] = item }
    default: {
      console.log(`task '${task}' unsupported. we only support 'add', 'remove' and 'modify'`)
      process.exit()
    }
  }
  render()
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
// any time an event occurs where the screen should update should pipe to this
// method.
// the idea is that this method will always build the overlay and potentially
// build whatever the current interface is requesting.
function render() {
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

  print(text)
}
function print(text) {
  console.clear()
  readline.clearLine(process.stdout, 0)
  readline.cursorTo(process.stdout, 0)
  process.stdout.write(text)
}
function createOverlay() {
  let text = ''
  let iconArr = []
  let delimiter = Array(state.dimensions.columns).fill('_').join('')
  // for now lets assume each icon is 3 characters(space front,end and char itself)
  // since chalk adds to the string length but not the length rendered in console

  // fuck it, I know the length is supposed to be 17 with 2 utf8 and 2 emoji, update
  // later
  const iconStringLength = 17
  if (state.overlay.playing) iconArr.push(chalk.green(' ▶ '))
  else iconArr.push(' ▶ ')
  if (state.overlay.recording) iconArr.push(chalk.red(' ● '))
  else iconArr.push(' ● ')
  switch(state.overlay.mode) {
    case 'navigate': { iconArr.push(' 🔃 ') } break
    case 'input': { iconArr.push(' 🔤 ') } break
    case 'game': { iconArr.push(' 🎮 ') } break
    default: { console.log(`mode '${overlay.mode}' unsupported`);process.exit() } break
  }
  switch(state.overlay.location) {
    case 'home': { iconArr.push(' 🏠 ') } break
    case 'benkyou': { iconArr.push(' 🈴 ') } break
    case 'settings': { iconArr.push(' 🛠 ') } break
    case 'game': { iconArr.push(' 🆚 ') } break
    default: { console.log(`mode '${overlay.mode}' unsupported`);process.exit() } break
  }
  text += `${iconArr.join(' ')}\n`
  text += `${delimiter}\n`
  return text
}
