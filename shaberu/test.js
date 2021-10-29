const speech = require('@google-cloud/speech');
const textToSpeech = require('@google-cloud/text-to-speech')
const {Translate} = require('@google-cloud/translate').v2
const spawn = require('child_process').spawn
const Util = require('./lib/util.js')
const util = new Util()

util.on('log', (log) => { console.log(log.message) })

const termux = {
  startRecord: async () => {
    spawn('termux-microphone-record', [
      '-f', 'request.m4a', '-r', '48000', '-c', '1', '-b', '16'
    ])
  },
  stopRecord: async () => {
    spawn('termux-microphone-record', ['-q'])
  },
  playAudioFile: async (audioPath) => {
    // TODO: implement stop
    spawn('termux-media-player', ['play', audioPath])
  },
  speak: async (lang, text) => {
    // TODO: test if we can listen for exit event
    spawn('termux-tts-speak', ['-l', lang, '-r', '0.7', text])
  }
}

any()
async function any() {
  console.log(util.settings)
}

//stt()
async function stt() {
  const config = {
    encoding: 'OGG_OPUS',
    sampleRateHertz: 48000,
    languageCode: mainMenu[selectedOption].from
  }
  console.log(
    await util.stt_google(
      `/data/data/com.termux/files/home/projects/dump/aibo/request.ogg`,
      config
    )
  )
}

//speak()
async function speak() {
  termux.speak('en_US', 'using termux speak from code!')
  await util.delay(4000)
  termux.speak('ja_JP', 'こんぱんわ この くさたり')
}

//recordAndPlayTermux()
async function recordAndPlayTermux() {
  termux.startRecord()
  console.log('recording started')
  await util.delay(5000)
  termux.stopRecord()
  console.log('recording stopped')
  await util.delay(1000)
  await termux.playAudioFile(`request.wav`)
  console.log('played file')
}
