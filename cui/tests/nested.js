/*
  Fourth attempt, navigating n levels of nesting properly, born from select.js.
  Dai seiko. going back up the tree was already built in the last iteration. Also
  added breakcrumb support
*/
const chalk = require('chalk')
const readline = require('readline')
readline.emitKeypressEvents(process.stdin)

if (process.stdin.isTTY) { process.stdin.setRawMode(true) }

process.stdin.on('keypress', (str, key) => {
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
      name: 'Manage Things',
      type: 'menu',
      options: [
        {
          name: 'Thingoid #0',
          type: 'menu',
          options: [
            {
              name: 'thigoud Quit #0',
              type: 'function',
              handler: () => {
                console.log(JSON.stringify(stack))
                process.exit(0)
              }
            },
            {
              name: 'thigoud Quit #1',
              type: 'function',
              handler: () => {
                console.log(JSON.stringify(stack))
                process.exit(0)
              }
            }
          ]
        },
        {
          name: 'Some Other Thing #1',
          type: 'menu',
          options: [
            {
              name: 'other Quit #0',
              type: 'function',
              handler: () => {
                console.log(JSON.stringify(stack))
                process.exit(0)
              }
            },
            {
              name: 'other Quit #1',
              type: 'function',
              handler: () => {
                console.log(JSON.stringify(stack))
                process.exit(0)
              }
            }
          ]
        },
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
        case 'menu': {
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
  // render breadcrumbs
  if (stack.length > 1) {
    const crumbArr = []
    for (let i = 1; i < stack.length; i++) {
      crumbArr.push(trim(stack[i].name, 20, true))
    }
    text += `${chalk.cyan.bold(crumbArr.join(' > '))}\n`
  } else {
    text += chalk.cyan.bold('HOME\n')
  }
  // render rest of shit
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

function trim(string, maxLength, prependThingy) {
  if (!string || !string.length) return string
  if (string.length < maxLength) return string
  else {
    if (prependThingy) return `${string.substring(0, maxLength-4)}...`
    else return string.substring(0, maxLength)
  }
}
