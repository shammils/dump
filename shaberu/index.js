const chalk = require('chalk')
const Util = require('./lib/util.js')
const util = new Util()
const spawn = require('child_process').spawn
const fs = require('fs-extra')

const readline = require('readline')
readline.emitKeypressEvents(process.stdin)
if (process.stdin.isTTY) { process.stdin.setRawMode(true) }
process.stdin.on('keypress', (str, key) => {
  //console.log(key.name)
  if (key.name === 'escape') process.exit(0)
  if (!processing) navigate(key)
})

// termux と linux, それ だけ だ. まど は ぜんぜん しらないん です けど ね
const usingTermux = process.env.SHELL.includes('com.termux')
let audioProcess // linux desktop only

let recording = false
let processing = false // true when posting to cloud
let playing = false // TODO: use this value to prevent actions while playing/speaking

let currentRow = 0
let selectedOption
const mainMenu = {
  //'にほんご   まで   にほんご',
  'にほんご   まで   えいご': {
    from: 'ja-JP',
    to: 'en-US'
  },
  'えいご     まで   にほんご': {
    from: 'en-US',
    to: 'ja-JP',
  },
  //'えいご     まで   えいご',
}
const mainMenuArr = Object.keys(mainMenu)
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
      console.log(`\nunsupported log level ${log.level}, message: ${log.message}`)
      process.exit(500)
    } break
  }
  if (logStream.length > maxLogLength) logStream.shift()
  draw()
}

;(async () => {
  await fs.ensureDir('./temp')
  await fs.emptyDir('./temp')
  draw()
})()

async function navigate(key) {
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
      if (currentRow < mainMenuArr.length-1) {
        currentRow += 1
      }
    }
  }
  if (key.name === 'return') {
    if (selectedOption) {
      if (currentRow === 0) {
        //log({level:'debug',message:`pushing recording to interwebs`});draw()
        stopRecord()
        submit()
        // play for debugging reasons
        //play()
      } else {
        // only 2 options atm
        stopRecord()
        reset()
        // clean up audio files
        await fs.emptyDir('./temp')
      }
    } else {
      selectedOption = mainMenuArr[currentRow]
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
    for (let i = 0; i < mainMenuArr.length; i++) {
      if (currentRow === i) {
        text += chalk.underline.bold(`> ${mainMenuArr[i]}\n`)
      } else {
        text += `  ${mainMenuArr[i]}\n`
      }
    }
  }
  print(text)
}

function print(message) {
  console.clear()
  readline.clearLine(process.stdout, 0)
  readline.cursorTo(process.stdout, 0)
  // append log stream. TODO: move this code to the draw() function?
  if (logStream.length) {
    message += '\n___________\n'
    for (let i = 0; i < logStream.length; i++) message += `${logStream[i]}\n`
    message += '\n___________\n'
  }
  process.stdout.write(message)
}

async function startRecord() {
  recording = true
  if (usingTermux) {
    spawn('termux-microphone-record', [
      '-f', `${__dirname}/temp/${util.settings.termux.record.file}`, '-e', 'amr_wb'
    ])
  } else {
    audioProcess = spawn('arecord', [
      `${__dirname}/temp/${util.settings.linux.file}`, '-c', '1', '-r', '48000', '-f', 'S16_LE'
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
    spawn('termux-microphone-record', ['-q'])
    // we require one more step for termux: convert to PCM using ffmpeg
    await util.delay(500)
    await convertAMRToPCM(
      `${__dirname}/temp/${util.settings.termux.record.file}`,
      `${__dirname}/temp/${util.settings.termux.ffmpeg.file}`
    )
  } else {
    audioProcess.kill('SIGTERM');
    audioProcess = null;
  }
  recording = false
}

async function convertAMRToPCM(from, to, backoff = 0) {
  if (backoff === 10) {
    console.log('took too long to flush amr to disk')
    process.exit(0)
  }
  if (fs.existsSync(from)) {
    const code = await util.convertFileUsingFfmpeg(from, to)
    if (code !== 0) {
      // probably still too early
      await util.delay(100*backoff)
      return convertAMRToPCM(from, to, backoff + 1)
    }
  } else {
    await util.delay(100*backoff)
    return convertAMRToPCM(from, to, backoff + 1)
  }
}

async function submit() {
  // push recording to STT -> Translate -> TTS service
  log({level:'debug',message:`selectedOption: ${selectedOption}`})
  processing = true
  let fileName
  let sttConfig
  if (usingTermux) {
    sttConfig = {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: mainMenu[selectedOption].from
    }
    fileName = util.settings.termux.ffmpeg.file
    const sttRes = await util.stt_google(`${__dirname}/temp/${fileName}`, sttConfig)
    const translationRes = await util.translate_google(sttRes.text, mainMenu[selectedOption].to.split('-')[0])
    speak(translationRes.text, mainMenu[selectedOption].to.replace('-', '_'))
    // clean up audio files
    await fs.emptyDir('./temp')
  } else {
    sttConfig = {
      encoding: 'LINEAR16',
      sampleRateHertz: 48000,
      languageCode: mainMenu[selectedOption].from
    }
    speak('not actually doing anything', 'en-US')
  }

  processing = false
  reset()
}

async function speak(text, lang) {
  if (usingTermux) {
    // only termux support
    // TODO: reference speech speed from settings
    spawn('termux-tts-speak', ['-l', lang, '-r', '0.7', text])
  } else {
    log({level:'info',message:`saying '${text}' in ${lang}!`})
  }
}

async function play() {
  if (usingTermux) {
    spawn('termux-media-player', ['play', `${__dirname}/temp/${util.settings.termux.ffmpeg.file}`])
  } else {
    // tried to install sox on termux, but sox wont either record my audio properly
    // or wont play it properly

    // padding a little time to allow wav to flush to disk for testing
    await util.delay(1000)
    // theres a copy of this in util, use that one
    const p = spawn('play', [`${__dirname}/temp/${util.settings.linux.file}`]);
    p.stdout.on('data', (data) => {
      log({level:'debug',message:`play stdout: ${data}`})
    });
    p.stderr.on('data', (data) => {
      log({level:'debug',message:`play stderr: ${data}`})
    });
    p.on('close', (code) => {
      log({level:'debug',message:`play code: ${code}`})
      reset()
    });
  }
}

function reset() {
  selectedOption = null
  currentRow = 0
  draw()
}
