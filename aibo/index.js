const chalk = require('chalk')
const Util = require('./lib/util.js')
const util = new Util()
const spawn = require('child_process').spawn;

const readline = require('readline')
readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) { process.stdin.setRawMode(true) }
process.stdin.on('keypress', (str, key) => {
  //console.log(key.name)
  if (key.name === 'escape') process.exit(0)
  navigate(key)
});

// termux と linux, それ だけ だ. まど は ぜんぜん しらないん です けど ね
const usingTermux = process.env.SHELL.includes('com.termux')
let audioProcess

let currentRow = 0
let currentLevel = 0
let selectedOption
const mainMenu = [
  //'にほんご   まで   にほんご',
  'にほんご   まで   えいご',
  'えいご     まで   にほんご',
  //'えいご     まで   えいご',
]
const secondaryMenu = [
  'おわた',
  //'やりなおし',
  'とまれ',
]

const logStream = []
const maxLogLength = 10
util.on('log', log)
// im not printing which module the log comes from??
function log(log) {
  switch (log.level) {
    case 'debug': { logStream.push(chalk.blue(`${new Date().toISOString()}: ${log.message}`)) } break
    case 'info': { logStream.push(`${new Date().toISOString()}: ${log.message}`) } break
    case 'warn': { logStream.push(chalk.yellow(`${new Date().toISOString()}: ${log.message}`)) } break
    case 'error': { logStream.push(chalk.red(`${new Date().toISOString()}: ${log.message}`)) } break
    default: {
      console.log(`\nunsupported log level ${log.level}`)
      process.exit(500)
    } break
  }
  if (logStream.length > maxLogLength) logStream.shift()
}

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
        //log({level:'debug',message:`pushing recording to interwebs`});draw()
        stopRecord()
        //submit()
        // playing for debugging reasons
        play()
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
  // append log stream
  if (logStream.length) {
    message += '\n___________\n'
    for (let i = 0; i < logStream.length; i++) message += `${logStream[i]}\n`
    message += '\n___________\n'
  }
  process.stdout.write(message)
}

async function startRecord() {
  if (usingTermux) {
    // shit, dont know enough termux to write this yet. test.js here we come
    spawn('termux-microphone-record', [
      '-f', 'request.wav', '-r', '48000'
    ])
  } else {
    audioProcess = spawn('arecord', [
      'request.wav', '-c', '1', '-r', '48000', '-f', 'S16_LE'
    ]);
    audioProcess.stdout.on('data', (data) => {
      log({level:'debug',message:`arecord stdout: ${data}`})
    });
    audioProcess.stderr.on('data', (data) => {
      log({level:'debug',message:`arecord stderr: ${data}`})
    });
    audioProcess.on('close', (code) => {
      log({level:'debug',message:`arecord child process exited with code ${code}`})
    });
  }
}
async function stopRecord() {
  if (usingTermux) {

  } else {
    // this code might work for both
    audioProcess.kill('SIGTERM');
    audioProcess = null;
  }
}
async function submit() {
  // push recording to STT -> Translate -> TTS service

}
async function play() {
  if (usingTermux) {

  } else {
    // padding a little time to allow wav to flush to disk for testing
    await util.delay(3000)
    // TODO: do something to prevent user input
    // theres a copy of this in util, use that one
    const p = spawn('play', [`${__dirname}/request.wav`]);
    p.stdout.on('data', (data) => {
      log({level:'debug',message:`play stdout: ${data}`})

    });
    p.stderr.on('data', (data) => {
      log({level:'debug',message:`play stderr: ${data}`})
    });
    p.on('close', (code) => {
      log({level:'debug',message:`play code: ${code}`})
      // TODO: do something to re-enable user input
      selectedOption = null
      currentRow = 0
      draw()
    });
  }
}
