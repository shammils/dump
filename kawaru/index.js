//import * as readline from 'node:readline'
//import { stdin as input, stdout as output } from 'node:process'
const readline = require('node:readline')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const _ = {
  selectedKana: 'hiragana',
  kana: {
    hiragana: 'hiragana',
    katakana: 'katakana',
    kanji: 'kanji',
  }
}

rl.on('line', input => {
  if (!input.length) { return }
  if (input.startsWith('-c')) {
    if (input === '-c h') { _.selectedKana = _.kana.hiragana;displayChangeSuccess() }
    else if (input === '-c k') { _.selectedKana = _.kana.katakana;displayChangeSuccess() }
    else if (_.kana[input]) { _.selectedKana = _.kana[input];displayChangeSuccess() }
    return
  }

  parseInput(input.toLowerCase())
})

const instructions = `type romanji words to convert into kana
type '-c <kana type>' to change kana. supported: (h)iragana, (k)atakana
selected: ${_.selectedKana}
TODO: this script is simple, no libs, convert into Clojure/C or something`

;(async () => {
  console.log('still missing katakana only chars')
  console.log(instructions)
})()

function displayChangeSuccess() { console.log(`kana output changed to ${_.selectedKana}`) }
function parseInput(input) {
  let response = ''
  const vowels = 'aiueo'
  const data = getData()
  const arr = []
  let previousChar
  for (let i = 0; i < input.length; i++) { arr.push(input[i]) }

  while (arr.length) {
    if (~vowels.indexOf(arr[0])) {
      const char = _.selectedKana === _.kana.hiragana ? data.object[arr[0]]?.h : data.object[arr[0]]?.k
      if (!char) { throw Error(`failed to find ${_.selectedKana} for ${arr[0]}, input: ${input}, res: ${response}`) }
      if (previousChar === arr[0]) {
        response += _.selectedKana === _.kana.hiragana ? data.object['-']?.h : data.object['-']?.k
        previousChar = undefined
      } else {
        previousChar = arr[0]
        response += char
      }
      arr.splice(0, 1)
      continue
    }
    // TODO: handle 'n' chars, fug
    /*
    there are a few okish ways we can handle normal chars.
    - try the first two chars, and if they dont work, try the first 3 chars. if
      that fails, fail the attempt
    - keep plucking chars until it matches

    'n' chars fuck this whole thing up tremendously though, so lets build without
    handling them for now

    went with something else that solves the 'n' issue. I dont think its 100% impervious though,
    so flex it to see it fail

    ISSUES:
      - Kawaru Sueeden = スエーデン
        Genki  Sueeden = スウエーデン(with a tiny エ)
    */

    const loopResult = [
      {success:false}, // 1 char
      {success:false}, // 2 chars
      {success:false}, // 3 chars
    ]

    // 1 char attempt
    const char0 = _.selectedKana === _.kana.hiragana ? data.object[arr[0]]?.h : data.object[arr[0]]?.k
    if (char0) {
      loopResult[0].success = true
      loopResult[0].char = char0
      previousChar = arr[0]
    }
    // 2 char attempt
    if (arr.length > 1) {
      const char1 = _.selectedKana === _.kana.hiragana ? data.object[`${arr[0]}${arr[1]}`]?.h : data.object[`${arr[0]}${arr[1]}`]?.k
      if (char1) {
        loopResult[1].success = true
        loopResult[1].char = char1
        previousChar = arr[1]
      }
    }
    // 3 char attempt
    if (arr.length > 2) {
      const char2 = _.selectedKana === _.kana.hiragana ? data.object[`${arr[0]}${arr[1]}${arr[2]}`]?.h : data.object[`${arr[0]}${arr[1]}${arr[2]}`]?.k
      if (char2) {
        loopResult[2].success = true
        loopResult[2].char = char2
        previousChar = arr[2]
      }
    }

    // longest kana has priority
    if (loopResult[2].success) {
      arr.splice(0, 3)
      response += loopResult[2].char
      continue
    } else if (loopResult[1].success) {
      arr.splice(0, 2)
      response += loopResult[1].char
      continue
    } else if (loopResult[0].success) {
      arr.splice(0, 1)
      response += loopResult[0].char
      continue
    } else {
      console.error(`*** failed to find ${_.selectedKana} in ${arr.join('')}, input: ${input}, res: ${response} ***`)
      return
    }

    throw Error(`should not actually get this low`)
  }

  console.log('RESULT:', response)
}
function getData() {
  // TODO: one day stop having the object keys be romanji so you can add special cases
  return {
    string: `
あいうえお              アイウエオ
かきくけこ きゃきゅきょ   カキクケコ キャキュキョ
さしすせそ しゃしゅしょ   サシスセソ シャシュショ
たちつてと ちゃちゅちょ   タチツテト チャチュチョ
なにぬねの にゃにゅにょ   ナニヌネノ ニャニュニョ
はひふへほ ひゃひゅひょ   ハヒフヘホ ヒャヒュヒョ
まみむめも みゃみゅみょ   マミムメモ ミャミュミョ
やゆよ                 ヤユヨ
らりるれろ りゃりゅりょ   ラリルレロ リャリュリョ
わゐゑを               ワヰヱヲ
がぎぐげご ぎゃぎゅぎょ   ガギグゲゴ ギャギュギョ
ざじずぜぞ じゃじゅじょ   ザジズゼゾ ジャジュジョ
だぢづでど ぢゃぢゅぢょ   ダヂヅデド ヂャヂュヂョ
ばびぶべぼ びゃびゅびょ   バビブベボ ビャビュビョ
ぱぴぷぺぽ ぴゃぴゅぴょ   パピプペポ ピャピュピョ
んっ                   ン・ーヽヾヿ
`,
    object: {
      kya: { h: 'きゃ', k: 'キャ' }, sha: { h: 'しゃ', k: 'シャ' }, cha: { h: 'ちゃ', k: 'チャ' }, nya: { h: 'にゃ', k: 'ニャ' }, hya: { h: 'ひゃ', k: 'ヒャ' },
      kyu: { h: 'きゅ', k: 'キュ' }, shu: { h: 'しゅ', k: 'シュ' }, chu: { h: 'ちゅ', k: 'チュ' }, nyu: { h: 'にゅ', k: 'ニュ' }, hyu: { h: 'ひゅ', k: 'ヒュ' },
      kyo: { h: 'きょ', k: 'キョ' }, sho: { h: 'しょ', k: 'ショ' }, cho: { h: 'ちょ', k: 'チョ' }, nyo: { h: 'にょ', k: 'ニョ' }, hyo: { h: 'ひょ', k: 'ヒョ' },

      mya: { h: 'みゃ', k: 'ミャ' }, rya: { h: 'りゃ', k: 'リャ' }, gya: { h: 'ぎゃ', k: 'ギャ' }, ja: { h: 'じゃ', k: 'ジャ' }, bya: { h: 'びゃ', k: 'ビャ' },
      myu: { h: 'みゅ', k: 'ミュ' }, ryu: { h: 'りゅ', k: 'リュ' }, gyu: { h: 'ぎゅ', k: 'ギュ' }, ju: { h: 'じゅ', k: 'ジュ' }, byu: { h: 'びゅ', k: 'ビュ' },
      myo: { h: 'みょ', k: 'ミョ' }, ryo: { h: 'りょ', k: 'リョ' }, gyo: { h: 'ぎょ', k: 'ギョ' }, jo: { h: 'じょ', k: 'ジョ' }, byo: { h: 'びょ', k: 'ビョ' },

      pya: { h: 'ぴゃ', k: 'ピャ' }, //ja: { h: 'ぢゃ', k: 'ヂャ' },
      pyu: { h: 'ぴゅ', k: 'ピュ' }, //ju: { h: 'ぢゅ', k: 'ヂュ' },
      pyo: { h: 'ぴょ', k: 'ピョ' }, //jo: { h: 'ぢょ', k: 'ヂョ' },

      a: { h: 'あ', k: 'ア' }, ka: { h: 'か', k: 'カ' }, sa:  { h: 'さ', k: 'サ' },  ta: { h: 'た', k: 'タ' }, na: { h: 'な', k: 'ナ' },
      i: { h: 'い', k: 'イ' }, ki: { h: 'き', k: 'キ' }, shi: { h: 'し', k: 'シ' }, chi: { h: 'ち', k: 'チ' }, ni: { h: 'に', k: 'ニ' },
      u: { h: 'う', k: 'ウ' }, ku: { h: 'く', k: 'ク' }, su:  { h: 'す', k: 'ス' }, tsu: { h: 'つ', k: 'ツ' }, nu: { h: 'ぬ', k: 'ヌ' },
      e: { h: 'え', k: 'エ' }, ke: { h: 'け', k: 'ケ' }, se:  { h: 'せ', k: 'セ' },  te: { h: 'て', k: 'テ' }, ne: { h: 'ね', k: 'ネ' },
      o: { h: 'お', k: 'オ' }, ko: { h: 'こ', k: 'コ' }, so:  { h: 'そ', k: 'ソ' },  to: { h: 'と', k: 'ト' }, no: { h: 'の', k: 'ノ' },

      ha: { h: 'は', k: 'ハ' }, ma: { h: 'ま', k: 'マ' }, ra: { h: 'ら', k: 'ラ' },
      hi: { h: 'ひ', k: 'ヒ' }, mi: { h: 'み', k: 'ミ' }, ri: { h: 'り', k: 'リ' },
      hu: { h: 'ふ', k: 'フ' }, mu: { h: 'む', k: 'ム' }, ru: { h: 'る', k: 'ル' },
      he: { h: 'へ', k: 'ヘ' }, me: { h: 'め', k: 'メ' }, re: { h: 'れ', k: 'レ' },
      ho: { h: 'ほ', k: 'ホ' }, mo: { h: 'も', k: 'モ' }, ro: { h: 'ろ', k: 'ロ' },

      ga: { h: 'が', k: 'ガ' }, za: { h: 'ざ', k: 'ザ' }, da: { h: 'だ', k: 'ダ' }, ba: { h: 'ば', k: 'バ' }, pa: { h: 'ぱ', k: 'パ' },
      gi: { h: 'ぎ', k: 'ギ' }, ji: { h: 'じ', k: 'ジ' },                          bi: { h: 'び', k: 'ビ' }, pi: { h: 'ぴ', k: 'ピ' },
      gu: { h: 'ぐ', k: 'グ' }, zu: { h: 'ず', k: 'ズ' },                          bu: { h: 'ぶ', k: 'ブ' }, pu: { h: 'ぷ', k: 'プ' },
      ge: { h: 'げ', k: 'ゲ' }, ze: { h: 'ぜ', k: 'ゼ' }, de: { h: 'で', k: 'デ' }, be: { h: 'べ', k: 'ベ' }, pe: { h: 'ぺ', k: 'ペ' },
      go: { h: 'ご', k: 'ゴ' }, zo: { h: 'ぞ', k: 'ゾ' }, do: { h: 'ど', k: 'ド' }, bo: { h: 'ぼ', k: 'ボ' }, po: { h: 'ぽ', k: 'ポ' },


      ya: { h: 'や', k: 'ヤ' }, wa: { h: 'わ', k: 'ワ' },
      yu: { h: 'ゆ', k: 'ユ' },
      yo: { h: 'よ', k: 'ヨ' },  //o: { h: 'を', k: '' },

      n: { h: 'ん', k: 'ン' },
      '-': { h: 'っ', k: 'ー' },
    },
  }
}
