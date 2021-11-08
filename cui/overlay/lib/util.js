const fs = require('fs-extra')

const readline = require('readline')
readline.emitKeypressEvents(process.stdin)
if (process.stdin.isTTY) { process.stdin.setRawMode(true) }

// termux と linux, それ だけ だ. まど は ぜんぜん しらないん です けど ね
const usingTermux = process.env.SHELL.includes('com.termux')

const api = {
  usingTermux,
  modes: {
    navigate: 'navigate',
    multiSelect: 'multi-select',
    input: 'input',
  },
  menuItemTypes: {
    function: 'function',
    select: 'select',
    menu: 'menu',
    multiSelect: 'multi-select',
    boolean: 'boolean',
    input: 'input',
    grid: 'grid', // supports left and right
  },
  dataTypes: {
    function: 'function',
    text: 'text',
    number: 'number',
    boolean: 'boolean',
    float: 'float',
    integer: 'integer',
  },
  print: (text) => {
    console.clear()
    readline.clearLine(process.stdout, 0)
    readline.cursorTo(process.stdout, 0)
    process.stdout.write(text)
  },
  delay: ms =>
  new Promise(resolve =>
    setTimeout(() => resolve(), ms)),
  trim: (string, maxLength, prependThingy) => {
    if (!string || !string.length) return string
    if (string.length < maxLength) return string
    else {
      if (prependThingy) return `${string.substring(0, maxLength-4)}...`
      else return string.substring(0, maxLength)
    }
  },
  createBreadcrumbs: (menuStack, maxLength) => {
    // dont bother creating crumbs if we are at the top level
    if (!menuStack || !menuStack.length) return
    let crumbArr = []
    for (let i = 0; i < menuStack.length; i++) {
       crumbArr.push(menuStack[i].name)
    }
    let crumbs = crumbArr.join(' > ')
    if (maxLength && crumbs.length > maxLength) {
      // truncate from the front
      crumbs = `...${crumbs.substring(crumbs.length-maxLength, crumbs.length-1)}`
    }
    return crumbs
  },
  shuffle: array => {
    let currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  },
  // keep this at the bottom for readablility reasons
  menuConfiguration: {
    'nan ji': [
      {
        name: 'Difficulty',
        required: true,
        description: 'the damn difficulty',
        type: 'select',
        options: [
          {
            name: 'choroi',
            description: 'basic',
            selected: true,
          },
          {
            name: 'muzukashii',
            description: 'zenbuu, cho karai',
          },
        ]
      },
      {
        name: 'Test Type',
        required: true,
        type: 'multi-select',
        options: [
          {name:'random', selected: true},
          // too many possible variations, fuck it for now
          /*{name:'Question kanji, answer english'},
          {name:'Question kanji, answer romanji'},

          {name:'Question romanji, answer english'},
          {name:'Question romanji, answer kanji'},

          {name:'Question english, answer kanji'},
          {name:'Question english, answer romanji'},

          {name:'Question audible, answer kanji'},
          {name:'Question audible, answer romanji'},
          {name:'Question audible, answer english'}*/
        ]
      },
      {
        name: 'Count',
        description: 'How many questions you want. 0 for all',
        type: 'input',
        inputType: 'number',
        min: 0,
        value: 0,
        required: true,
      }
    ],
    'kanji': [
      {
        // automatically add a 'select all' option. if all are selected, switch
        // it to the opposite. (deselect all?)
        name: 'Grade',
        description: 'References japanese schooling system I think',
        type: 'multi-select', // this value will come from util
        required: true,
        options: [
          {name:'1',value:'1'},
          {name:'2'},
          {name:'3'},
          {name:'4'},
          {name:'5'},
          {name:'6'},
        ]
      },
      {
        name: 'Shuffle',
        description: 'Change the order of the questions',
        type: 'input',
        inputType: 'boolean',
        value: true,
        required: true,
      },
      {
        // a 'select' type means only one can be selected at a time.
        name: 'Direction',
        description: 'How do you want to take the test basically. terrible desc',
        type: 'select',
        required: true,
        options: [
          {name:'random', selected: true},
          {name:'Question kanji, answer english'},
          {name:'Question kanji, answer romanji'},
          {name:'Question english, answer kanji'},
          {name:'Question english, answer romanji'},
          {name:'Question audible, answer kanji'},
          {name:'Question audible, answer romanji'},
          {name:'Question audible, answer english'},
        ]
      },
      {
        name: 'Count',
        // description is shown when selecting the item.
        // TODO: reserve a single row to show descriptions when 'hovering' over
        // item
        description: 'How many questions you want. 0 for all',
        type: 'input',
        // the default input type is text
        inputType: 'number',
        min: 0,
        max: 5,
        value: 0,
        // no way for us to know max unless we know how many possible options are
        // available at the given time
        // max: ?
        required: true,
      }
    ],
    'kotoba': [
      {
        displayName: 'Test Type',
        name: 'type',
        required: false,
        type: 'multi-select',
        options: [
          {name:'who cares', value: 'random', selected: true},
          // too many possible variations, fuck it for now
          // selecting kana in a table to build words
          // type romanji, type english
          // select romanji, kana and hear/see jp/en
          // hear word(jp/en), input answer, no visual references
          // select from predefined list from visual/audible question in any lang
          // TOO MANY COMBOS SHIT
        ]
      },
      {
        name: 'Count',
        description: 'How many questions you want. 0 for all',
        type: 'input',
        inputType: 'number',
        min: 0,
        value: 0,
        required: false,
      }
    ],
  },
}

module.exports = api
