/*
  First attempt at switching between input and navigation, absolute failure. no
  real reason to ever run this code
*/
const chalk = require('chalk')
const readline = require('readline')
let rl

let currentRow = 0
let currentLevel = 0
let selectedOption
let selectedOptions = []
let mainMenuArr
let subMenuArr
let menus = {
  'Add Menu Item': {
    handler: async () => {
      prompt('> ', (res) => {
        if (!res.length) {
          console.log('shine')
          process.exit(0)
        }
        menus[res] = {
          handler: async () => {
            console.log('DEKITA!!!!')
            process.exit(0)
          }
        }

        enableNavigation()
        mainMenuArr = Object.keys(menus)
        draw()
      })
    }
  },
  'Quit': {
    handler: async () => {
      console.log('bye')
      process.exit(0)
    }
  },
}

;(async () => {
  enableNavigation()
  mainMenuArr = Object.keys(menus)
  draw()
})()

function enableNavigation() {
  readline.emitKeypressEvents(process.stdin)
  if (process.stdin.isTTY) { process.stdin.setRawMode(true) }
  process.stdin.on('keypress', (str, key) => {
    //console.log(key.name)
    if (key.name === 'escape') process.exit(0)
    navigate(key)
  });
}

function disableNavigation() {
  process.stdin.setRawMode(false)
  process.stdin.pause()
}

function prompt(question, cb) {
  print('')
  disableNavigation()
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  rl.question(question, (response) => {
    cb(response)
  })
}

function navigate(key) {
  if (key.name === 'up') {
    if (currentRow > 0) {
      currentRow -= 1
    }
  }
  if (key.name === 'down') {
    if (currentRow < mainMenuArr.length-1) {
      currentRow += 1
    }
  }
  if (key.name === 'return') {
    menus[mainMenuArr[currentRow]].handler()
  }
  if (key.name === 'backspace') {
    // TODO: go up levels properly. for now im just going back to level 0
    currentRow = 0
    currentLevel = 0
    selectedOption = undefined
  }
  if (key.name === 'space') {
    if (menus[selectedOption].type === 'multi') {

    }
  }
  draw()
}
function draw() {
  let text = ''
  if (selectedOption) {
    // draw items belonging to selected option
    if (!menus[selectedOption]) {
      console.log(`selected option ${selectedOption} does not exist in menu`)
      process.exit(0)
    }
    if (!menus[selectedOption].type) {
      // invoke handler immediately
      // await?
      menus[selectedOption].handler()
    } else {
      if (menus[selectedOption].type === 'multi') {
        text += `> ${chalk.green(selectedOption)}\n`
        for (let i = 0; i < menus[selectedOption].options.length; i++) {
          //console.log('here')
          //process.exit(0)\
          if (currentRow === i) {
            text += chalk.underline.bold(` > ${menus[selectedOption].options[i]}\n`)
          } else {
            text += ` > ${menus[selectedOption].options[i]}\n`
          }
        }
      }
    }
    //selectedOption = undefined
  } else {
    // draw top level mainMenuArr
    for (let i = 0; i < mainMenuArr.length; i++) {
      if (currentRow === i) {
        text += chalk.underline.bold(`> ${mainMenuArr[i]}\n`)
      } else {
        text += `  ${mainMenuArr[i]}\n`
      }
    }
    //text += `currentRow: ${currentRow}`
  }
  print(text)
}

function handle(ln) {
  console.log(`you typed '${ln}'`)
}

function print(message) {
  console.clear()
  readline.clearLine(process.stdout, 0)
  readline.cursorTo(process.stdout, 0)
  process.stdout.write(message)
}
