// just going to dump functions here for now, dumping ground landfill style
const nodeUtil = require('util')
const EventEmitter = require('events').EventEmitter

const spawn = require('child_process').spawn
const speech = require('@google-cloud/speech');
const textToSpeech = require('@google-cloud/text-to-speech');
const {Translate} = require('@google-cloud/translate').v2;
const fs = require('fs');

let _self
function log(level, message) { _self.emit("log",{module:'util',level,message})}

// TODO: wrap everything in tries, I want the logs to pipe properly for the first
// time in my life
class Util {
	constructor() {
		_self = this
		EventEmitter.call(this)
	}
  convertIntToKana(num, type) {
    const map = {
      "0":     {kj: '零',        hi: ['れい'], kt: ''},
      "1":     {kj: '一',        hi: ['いち'], kt: ''},
      "2":     {kj: '二',        hi: ['に'], kt: ''},
      "3":     {kj: '三',        hi: ['さん'], kt: ''},
      "4":     {kj: '四',        hi: ['し','よん'], kt: ''},
      "5":     {kj: '伍',        hi: ['ご'], kt: ''},
      "6":     {kj: '六',        hi: ['ろく'], kt: ''},
      "7":     {kj: '七',        hi: ['しち','なな'], kt: ''},
      "8":     {kj: '八',        hi: ['はち'], kt: ''},
      "9":     {kj: '九',        hi: ['きゅう','く'], kt: ''},
      "10":    {kj: '十',        hi: ['じゅう'], kt: ''},
      "100":   {kj: '百',        hi: ['ひゃく','びゃく'], kt: ''},
      "1000":  {kj: ['千','仟'], hi: ['せん'], kt: ''},
      "10000": {kj: '萬',        hi: ["まん","ばん"], kt: ''},
    }
    const gv = (selectedMap) => {
      if (type && type === 'hi') {
        if (selectedMap.hi.length > 1)
          return selectedMap.hi[Math.floor(Math.random() * Math.floor(2))];
        return selectedMap.hi[0];
      }
      return selectedMap.kj;
    };
    const arrayify = (n) => {
      const s = n.toString();
      const arr = [];
      for (let i = 0; i < s.length; i++) arr.push(s[i]);
      return arr;
    }
    const mulch1 = (n) => gv(map[n.toString()]);
    const mulch2 = (n) => {
      if (n === 10) return gv(map[n.toString()]);
      if (n < 20) return `${gv(map['10'])}${gv(map[(n-10).toString()])}`;
      else {
        const chars = arrayify(n);
        return `${gv(map[chars[0]])}${gv(map['10'])}${chars[1] === '0' ? '' : gv(map[chars[1]])}`;
      }
    };
    const mulch3 = (n) => {
      if (n === 100) return gv(map['100']);
      const chars = arrayify(n);
      if (n < 200) {
        if (chars[1] === '0') return `${gv(map['100'])}${mulch1(n-100)}`
        return `${gv(map['100'])}${mulch2(n-100)}`
      }
      if (chars[1] === '0' && chars[2] === '0') return `${gv(map[chars[0]])}${gv(map['100'])}`;
      if (chars[1] === '0') return `${gv(map[chars[0]])}${gv(map['100'])}${gv(map[chars[2]])}`
      const dubs = mulch2(parseInt(`${chars[1]}${chars[2]}`));
      return `${gv(map[chars[0]])}${gv(map['100'])}${dubs}`
    };
    // IN PROGRESS
    const mulch4 = n => {
      if (n === 1000) return gv(map['1000']);
    };
    if (isNaN(num)) {
      log('error', `number ${num} inst a number`)
      return;
    }
    if (num > 999999) {
      log('warn', `bango ${num} wa dekai sugiru`)
      return;
    }
    if (num < 10) { return mulch1(num); }
    if (num > 9 && num < 100) { return mulch2(num); }
    if (num > 99 && num < 1000) { return mulch3(num); }
    if (num > 999 && num < 10000) { return; }
  }
  convertTimeToKana(date) {
    // swapping は with わ for now so it can sound right in google
    //let kana = 'いまはreplaceです';
    let kana = 'いまわreplaceです';
    let hour = '';
    let minute = '';
    const h = date.getHours();
    const m = date.getMinutes();
    let planC = false;
    // TODO: lookup how to say this to a nip, this being 00:01(for example)
    // midnight = 真夜中 (mayonaka? inside mayo...)
    if (h === 0 && m === 0) {
      // I guess this isnt impossible to do, a whole 60 seconds every 24 hours this
      // can happen
      planC = true;
    } else {
      if (h === 0) hour = 'れい'; // maru??
      else {
        hour = api.convertIntToKana(h);
      }
      if (m > 0) {
        if (m === 30) minute = 'はん';
        else minute = `${api.convertIntToKana(m)}ぷん`;
      }
    }
    if (planC) kana = kana.replace('replace', '真夜中');
    else kana = kana.replace('replace', `${hour}じ${minute}`);
    return kana;
  }
  playAudio(audioPath) {
    const promise = new Promise((resolve, reject) => {
      const p = spawn('play', [audioPath]);
      p.stdout.on('data', (data) => {
        log('debug', `play stdout: ${data}`);
      });
      p.stderr.on('data', (data) => {
        log('error', `play stderr: ${data}`);
      });
      p.on('close', (code) => {
        if (code === 0) resolve();
        else {
          log('debug', `play received code ${code} attempting to play audio`)
          resolve(); // fuck it for now
        }
      });
    });
    return promise;
  }
  copy(from, to) {
    const promise = new Promise((resolve, reject) => {
      const p = spawn('cp', [from, to]);
      p.stdout.on('data', (data) => {
        log('debug', `copy stdout: ${data}`);
      });
      p.stderr.on('data', (data) => {
        log('debug', `copy stderr: ${data}`);
      });
      p.on('close', (code) => {
        if (code === 0) resolve();
        else {
          log('debug', `copy received code ${code} attempting to copy file`)
          resolve(); // fuck it for now
        }
      });
    });
    return promise;
  }
  delay(ms) {
    return new Promise(resolve =>
      setTimeout(() => resolve(), ms))
  }
  async stt_google(filePath, languageCode) {
    log('debug', `stt_google: fp: ${filePath}, lc: ${languageCode}`)
    const client = new speech.SpeechClient({
      projectId: process.env.GOOGLECLOUDPROJECTNAME,
      keyFilename: process.env.GOOGLECLOUDKEY,
    })
    const request = {
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 48000,
        languageCode,//ja-JP en-US
      },
      audio: {
        content: fs.readFileSync(filePath).toString('base64'),
      }
    }
    const [response] = await client.recognize(request)
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n')
    log('debug', `stt_google transcription res: ${transcription}`)
    return {
      text: transcription,
      integration: 'google',
      languageCode,
    }
  }
  async tts_google(text, languageCode, config, fileSavePath) {
    // if things go as planned, I will never use this method, not even to see if
    // it works
    log('debug', `tts_google ${JSON.stringify({text, languageCode, config, fileSavePath})}`)
    const client = new textToSpeech.TextToSpeechClient({
      projectId: process.env.GOOGLECLOUDPROJECTNAME,
      keyFilename: process.env.GOOGLECLOUDKEY,
    })
    const params = {
      input: {text},
      // Select the language and SSML voice gender (optional)
      voice: {languageCode, ssmlGender: config.gender},
      // select the type of audio encoding
      audioConfig: {audioEncoding: 'LINEAR16'},
    }
    if (config.voice) params.name = config.voice
    const [response] = await client.synthesizeSpeech(params)
    //fs.writeFileSync(fileSavePath, response.audioContent, 'binary')
    return {
      integration: 'google',
      audio: response.audioContent,
    }
  }
  async translate_google(text, target) {
    log('debug', `translate_google start: '${text}', '${target}'`)
    const translate = new Translate({
      projectId: process.env.GOOGLECLOUDPROJECTNAME,
      keyFilename: process.env.GOOGLECLOUDKEY,
    })
    const [translation] = await translate.translate(text, target)
    log('debug', `translate_google translation '${translation}'`)
    return {
      text: translation,
      integration: 'google',
    }
  }
}
nodeUtil.inherits(Util, EventEmitter)

module.exports = Util
