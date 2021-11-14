const MainMenu = require('./modules/mainMenu.js')
//const OverlayMenu = require('./modules/overlayMenu.js')
const Logger = require('./lib/logger.js')

const logger = new Logger()
function onLog(moduleName, level, message) {
  logger.log(moduleName, level, message)
}
const readline = require('readline')
readline.emitKeypressEvents(process.stdin)
if (process.stdin.isTTY) { process.stdin.setRawMode(true) }

process.stdin.on('keypress', (str, key) => {
  // escape and CTRL+c behavior moved to base class
  state[state.interactionTarget][state[state.interactionTarget].length-1].onKeypress(str, key)
})
process.stdout.on('resize', () => {
  // im too lazy to fetch the dims from the state when I have access to process
  // everywhere, so just redraw
  state[state.interactionTarget][state[state.interactionTarget].length-1].draw()
})

// do not expose the state object to anyone, only the updateState method
const state = {
  applicationModules: [],
  overlayModules: [],
  interactionTarget: 'applicationModules', // 'overlay', 'application'
  /*dimensions: {
    columns: process.stdout.columns,
    rows: process.stdout.rows,
  },*/
  speakOn: true,
  recording: false,
  mode: 'navigate',
  location: 'home',
}

const stateInterface = {
  stack: (task, item) => {
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
  },
  get: (property) => {
    if (!property || !property.length || typeof property !== 'string') {
      console.log(`invalid property '${property}'`)
      process.exit()
    }
    if (property === 'stack') {
      console.log('do not directly access this property')
      process.exit()
    }
    if (property === 'stackNameArray') {
      return state[state.interactionTarget].map(m => m.name)
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
  },
  update: (property, value) => {
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
}
;(async () => {
  const mainMenu = new MainMenu(stateInterface, onLog)
  state.applicationModules.push(mainMenu)
  mainMenu.draw()
})()
