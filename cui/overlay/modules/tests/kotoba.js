const util = require('../../lib/util.js')
const chalk = require('chalk')
const ViewBuilder = require('../../lib/viewBuilder.js')

// TODO: make this generic enough to move the the testBuilder/testHelper util
// and be used my other test modules
const createTestSuite = (params) => {
  const test = {
    index: 0,
    state: 'asking', // asking, answered, completed
    isCorrect: null,
    options: [],
    metrics: {
      start: null,
      end: null,
      correct: 0,
      // TODO: add question specific metrics
    }
  }
  /*
    Test Types:
      - show kana/english, user selects kana/english shit
        - problem is pool of incorrect options is nil atm
        - instruction: 'Select Answer'
      - speak nihongo/english, user selects kana/english
        - clearly need to make sure not to speak english and select english
      - speak question, user inputs romanji/english
        - instruction: 'Input Romanji/English Answer'

      *future
      - question proposed any way, user speaks answer
  */

  // ignore params, question and answer types for now, just show text and select
  // from a list of options, even if we have to put 1s and 0s as the incorrect
  // options

  // shuffle the test data every time for now
  util.shuffle(params.testData)
  // these currently match the prop names of the mockup test, should it stay
  // that way?

  for (let i = 0; i < params.testData.length; i++) {
    const wordOptions = ['kanji','furigana','romanji','english']
    const questionIndex = Math.floor(Math.random() * wordOptions.length)
    const questionType = wordOptions[questionIndex]

    wordOptions.splice(questionIndex, questionIndex+1)
    const answerIndex = Math.floor(Math.random() * wordOptions.length)
    const answerType = wordOptions[answerIndex]

    const question = {
      type: util.menuItemTypes.select,
      value: params.testData[i][questionType][0],
      instruction: `Select the correct answer`,
      options: util.shuffle([
        {
          value: params.testData[i][answerType][0],
          correct: true,
          sentence: params.testData[i].sentences[0]
        },
        { value: '0' },
        { value: 'dog' },
        { value: 'butt' },
      ])
    }
    test.options.push(question)
  }
  return test
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

    // these types can probably go in the testHelper... tabun
    this.questionTypes = {
      'audible': {

      },
      'text': {

      }
    }
    this.answerTypes = {
      // 'audible': {} // next version
      'input': {
        instruction: 'Use keyboard to input answer',
      },
      'list': {
        instruction: 'Select answer from list',
      },
      //'textGrid': { instruction: 'Select options to build answer' },
    }

    this.test = createTestSuite({
      testData: getData().data, // how tf is this going to work properly
      options: params, // how many questions, difficulty, etc
      questionTypes: this.questionTypes,
      answerTypes: this.answerTypes,
    })

    // I could scope this var to the question, but meh
    this.row = 0
    this.testState = {
      asking: 'asking',
      answered: 'answered',
      completed: 'completed',
    }
  }
  evaluateResponse() {

  }
  onKeypress(str, key) {
    this.navigate(key)
  }
  navigate(key) {
    const question = this.test.options[this.test.index]
    if (question.type !== util.menuItemTypes.select &&
    question.type !== util.menuItemTypes.grid) {
      console.log(`we dont support type ${this.question.type} during naviation`)
      process.exit(0)
    }
    if (key.name === 'up') {
      if (this.row > 0) {
        this.row -= 1
      }
    }
    if (key.name === 'down') {
      if (this.row < question.options.length-1) {
        this.row += 1
      }
    }
    // enter and space should work the same on lists
    if (key.name === 'return' ||
    key.name === 'space') {
      if (this.test.state === this.testState.answered) {
        // user was shown the question results
        this.row = 0
        this.test.index += 1
        this.test.isCorrect = null
        this.test.state = this.testState.asking
      } else {
        // show them their results
        const selected = question.options[this.test.index]
        this.test.isCorrect = selected.correct
        this.test.state = this.testState.answered
        if (selected.correct) {
          this.log('info', `correct answer selected: ${selected.value}`)
        } else {
          const correctAnswer = question.options.find(x => x.correct)
          this.log('info', `incorrect answer selected: '${selected.value}'. correct answer was '${correctAnswer.value}'`)
        }
      }

    }
    if (key.name === 'backspace') {}
    this.draw()
  }
  draw() {
    const vb = new ViewBuilder('list')
    // breadcrumbs still broken since I dont have access to the fucking stack...
    // what was I thinking
    vb.append({ type: 'static', style: 'breadcrumb', value: this.name })
    if (this.test.state === this.testState.asking) {
      const question = this.test.options[this.test.index]
      // show the question TODO: center
      vb.append({ type: 'static', style: 'bold', value: `kotai: '${question.value}'` })
      // add current instructions
      vb.append({ type: 'static', value: question.instruction })
      // render options(we're assuming list for now)
      const menu = { type:'menu', options:[]}
      for (let i = 0; i < question.options.length; i++) {
        menu.options.push({
          name: question.options[i].value,
          selected: this.row === i,
        })
      }
      vb.append(menu)
    } else if (this.test.state === this.testState.answered) {
      const question = this.test.options[this.test.index]
      if (this.test.isCorrect) vb.append({ type: 'static', style: 'success', value: 'SEKAI' })
      else vb.append({ type: 'static', style: 'error', value: `CHIGAU, correct answer was '${question.options.find(x => x.correct).value}'` })
    } else {
      // test complete, show final result
      vb.append({ type: 'static', style: 'error', value: 'nothing here' })
    }
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
