const spawn = require('child_process').spawn;
const Util = require('./lib/util.js')
const util = new Util()

util.on('log', () => {})

const termux = {
  startRecord: async () => {
    spawn('termux-microphone-record', [
      '-f', 'request.wav', '-r', '48000', '-c', '1', '-b', '16'
    ])
  },
  stopRecord: async () => {
    spawn('termux-microphone-record', ['-q'])
  },
  playAudioFile: async (audioPath) => {
    spawn('termux-media-player', ['play', audioPath])
  },
  speak: async () => {

  }
}

recordAndPlay()
async function recordAndPlay() {
  termux.startRecord()
  await util.delay(3000)
  termux.stopRecord()
  await util.delay(1000)
  await termux.playAudioFile(`request.wav`)
}
