/*
  Second attempt, born from close.js, success. Update a persistent value. of
  course will need tweeks to actually use
*/
const chalk = require('chalk')
/*
const ioHook = require('iohook')
ioHook.on('keypress', function (msg) {
  console.log(msg);
});
ioHook.start();
*/
const readline = require('readline')
//const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
readline.emitKeypressEvents(process.stdin);

if (process.stdin.isTTY) { process.stdin.setRawMode(true) }

process.stdin.on('keypress', (str, key) => {
  //console.log(key.name)
  if (key.name === 'escape') process.exit(0)
  if (mode === 'navigate') navigate(key)
  else if (mode === 'input') {
    if (key.name === 'return') {
      mode = 'navigate'
      draw()
    } else {
      // handle alphanumeric
      if (key.name && key.name.length === 1) input.push(key.sequence)
      // handle special chars
      if (!key.name && key.sequence.length === 1) input.push(key.sequence)
      // backspace
      if (key.name === 'backspace') input.pop()
      if (key.name === 'space') input.push(' ')
      print(`> ${input.join('')}`)
    }
  }
});

let mode = 'navigate'
let input = []
let currentRow = 0
let currentLevel = 0
let selectedOption
let selectedOptions = []
let mainMenuArr
let subMenuArr
const menus = {
  'Update Value': {
    handler: async () => {
      mode = 'input'
      print(`> ${input.join('')}`)
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
  mainMenuArr = Object.keys(menus)
  draw()
})()

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
  if (mode === 'navigate') print(text)
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
