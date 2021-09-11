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
  navigate(key)
});

let currentRow = 0
let currentOption
const options = [
  'option1',
  'option2'
]

;(async () => {
  draw()
  //rl.prompt()
  //  rl.on('line', handle)
})()

function navigate(key) {
  if (key.name === 'up') {
    if (currentRow > 0) {
      currentRow -= 1
    }
  }
  if (key.name === 'down') {
    if (currentRow < options.length-1) {
      currentRow += 1
    }
  }
  if (key.name === 'return') {

  }
  if (key.name === 'backspace') {

  }
  if (key.name === 'space') {
    
  }
  draw()
}
function draw() {
  let text = ''
  if (currentOption) {
    // draw items belonging to selected option

  } else {
    // draw top level options
    for (let i = 0; i < options.length; i++) {
      if (currentRow === i) {
        text += chalk.bold(`> ${options[i]}\n`)
      } else {
        text += `  ${options[i]}\n`
      }
    }
    //text += `currentRow: ${currentRow}`
    print(text)
  }
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
