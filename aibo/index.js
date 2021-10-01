const chalk = require('chalk')

const readline = require('readline')
readline.emitKeypressEvents(process.stdin);

if (process.stdin.isTTY) { process.stdin.setRawMode(true) }

process.stdin.on('keypress', (str, key) => {
  //console.log(key.name)
  if (key.name === 'escape') process.exit(0)
  navigate(key)
});

let currentRow = 0
let currentLevel = 0
let selectedOption
const mainMenu = [
  'にほんご   まで   にほんご',
  'にほんご   まで   えいご',
  'えいご     まで   にほんご',
  'えいご     まで   えいご',
]
const secondaryMenu = [
  'おわた',
  //'やりなおし',
  'とまれ',
]

;(async () => {
  draw()
})()

function navigate(key) {
  if (key.name === 'up') {
    if (currentRow > 0) {
      currentRow -= 1
    }
  }
  if (key.name === 'down') {
    if (selectedOption) {
      if (currentRow < secondaryMenu.length-1) {
        currentRow += 1
      }
    } else {
      if (currentRow < mainMenu.length-1) {
        currentRow += 1
      }
    }
  }
  if (key.name === 'return') {
    if (selectedOption) {
      if (currentRow === 0) {
        console.log('pushing recording to interwebs')
        stopRecord()
        submit()
        process.exit(0)
      } else {
        // only 2 options atm
        stopRecord()
        selectedOption = null
        currentRow = 0
      }
    } else {
      selectedOption = mainMenu[currentRow]
      currentRow = 0
      startRecord()
    }
  }
  if (key.name === 'backspace') {

  }
  if (key.name === 'space') {

  }
  draw()
}
function draw() {
  let text = ''
  if (selectedOption) {
    text += chalk.bold(`${selectedOption}\n`)
    //for (let i = 0; i < secondaryMenu.length; i++) {}
    switch (currentRow) {
      case 0: {
        text += chalk.green.bold(`> ${secondaryMenu[0]}\n`)
        text += chalk.red(`  ${secondaryMenu[1]}`)
      } break
      case 1: {
        text += chalk.green(`  ${secondaryMenu[0]}\n`)
        text += chalk.red.bold(`> ${secondaryMenu[1]}`)
      } break
    }
  } else {
    for (let i = 0; i < mainMenu.length; i++) {
      if (currentRow === i) {
        text += chalk.underline.bold(`> ${mainMenu[i]}\n`)
      } else {
        text += `  ${mainMenu[i]}\n`
      }
    }
  }
  print(text)
}

function print(message) {
  console.clear()
  readline.clearLine(process.stdout, 0)
  readline.cursorTo(process.stdout, 0)
  process.stdout.write(message)
}

async function startRecord() {

}
async function stopRecord() {

}
async function submit() {
  // push recording to STT -> Translate -> TTS service
  // play response
  play()
}
async function play() {

}
