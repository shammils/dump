const util = require('../../lib/util.js')
const chalk = require('chalk')
const ViewBuilder = require('../../lib/viewBuilder.js')

const createTestSuite = (data) => {
  /*
    Test Types:
      - show *kana, user selects english? shit
        - instruction: 'Select Answer'
      - show
  */
}

class KotobaTest {
  constructor(updateState, updateStack, onLog, params) {
    // these constructor vars can be moved to a base class at this point.
    // TODO: move things every class uses(logs) to base class
    this.name = 'Kotoba'
    this.onLog = onLog
    this.log = (level, message) => { this.onLog('kotoba', level, message) }
    this.updateState = updateState
    this.updateStack = updateStack
  }
  onKeypress(str, key) {
    this.navigate(key)
  }
  navigate(key) {
    if (key.name === 'up') {}
    if (key.name === 'down') {}
    if (key.name === 'return') {}
    if (key.name === 'backspace') {}
    if (key.name === 'space') {}

    this.draw()
  }
  draw() {
    const vb = new ViewBuilder('list')

    this.updateState('currentView', vb)
  }
  reset() {}
}

function getData() {
  return {
    someProp: 'someValue',
    data: [
      {
        kanji: ['船'],
        furigana: ['ふね'],
        romanji: ['fune'],
        english: ['ship','boat'],
        type: 'noun',
        sentences: [
          {
            kanji: '全員が 無事で 救助艇にいると 聞いて、私は 非常にうれしい。',
            furigana: 'ぜんいんが ぶじで きゅうじょてい にいるときいて、 わたしは ひじょうにうれしい。',
            english: 'I am only too glad to hear that all of them are safe and sound in the rescue boat.',
          }
        ]
      },
      {
        kanji: ['水'],
        furigana: ['みず'],
        romanji: ['mizu'],
        english: ['water'],
        type: 'noun',
        sentences: [
          {
            kanji: '村人は 井戸から 水を 手で 汲み上げなければならなかった。',
            furigana: 'むらびと はいどから みずを てで くみあなければならなかった。',
            english: 'The village people had to pump water from the well by hand.',
          }
        ]
      },
      {
        kanji: ['自転車'],
        furigana: ['じてんしゃ'],
        romanji: ['jitensha'],
        english: ['bicycle'],
        type: 'noun',
        sentences: [
          {
            kanji: '木の 下にある 自転車は 私のです。',
            furigana: 'きの したにある じてんしゃ は わたしのです。',
            english: 'The bicycle under the tree is mine.',
          }
        ]
      },
      {
        kanji: ['本'],
        furigana: ['ほん'],
        romanji: ['hon'],
        english: ['book'],
        type: 'noun',
        sentences: [
          {
            kanji: '昨日はその 本を８０ページまで 読んだ。',
            furigana: 'きのう は その ほん を８０ページまで よんだ。',
            english: 'I read the book up to page 80 yesterday.',
          }
        ]
      }
    ]
  }
}
module.exports = KotobaTest
