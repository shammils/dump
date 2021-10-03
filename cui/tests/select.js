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
  if (mode === 'navigate' || mode === 'multi-select') navigate(key)
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
const stack = []

const mainMenu = {
  type: 'menu',
  options: [
    {
      name: 'Select Options',
      type: 'multi-select',
      options: [
        {name: 'Optioin 1', selected: false },
        {name: 'Thingy', selected: false },
        {name: 'Cats for Days', selected: false },
      ],
    },
    {
      name: 'Quit',
      type: 'function',
      handler: () => {
        console.log('bye')
        process.exit(0)
      }
    }
  ]
}

;(async () => {
  stack.push(mainMenu)
  draw()
})()

function navigate(key) {
  let menuItem = stack[stack.length-1]
  current = menuItem.options[currentRow]
  if (key.name === 'up') {
    if (currentRow > 0) {
      currentRow -= 1
    }
  }
  if (key.name === 'down') {
    if (currentRow > 0) {
      console.log(current)
    }
    if (currentRow < menuItem.options.length-1) {
      currentRow += 1
    }
  }
  if (key.name === 'return') {
    if (mode === 'multi-select') {
      mode = 'navigate'
      stack.pop()
      currentRow = 0
    } else {
      switch(current.type) {
        case 'function': {
          current.handler()
        } break
        case 'select': {
          stack.push(current)
        } break
        case 'multi-select': {
          mode = 'multi-select'
          currentRow = 0
          stack.push(current)
        } break
      }
    }
  }
  if (key.name === 'backspace') {
    if (stack.length > 1) {
      mode = 'navigate'
      stack.pop()
      currentRow = 0
    }
  }
  if (key.name === 'space') {
    if (menuItem.type === 'multi-select') {
      menuItem.options[currentRow].selected = !menuItem.options[currentRow].selected
    }
  }

  draw()
}

function draw() {
  let text = ''
  const current = stack[stack.length-1]
  if (current.type === 'menu') {
    for (let i = 0; i < current.options.length; i++) {
      if (currentRow === i) {
        text += chalk.underline.bold(`> ${current.options[i].name}\n`)
      } else {
        text += `  ${current.options[i].name}\n`
      }
    }
  }
  if (current.type === 'multi-select') {
    text += `> ${chalk.green(current.name)}\n`
    for (let i = 0; i < current.options.length; i++) {
      const selected = current.options[i].selected ? '•' : '◦'
      if (currentRow === i) {
        text += chalk.underline.bold(` > ${selected} ${current.options[i].name}\n`)
      } else {
        text += ` > ${selected} ${current.options[i].name}\n`
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
