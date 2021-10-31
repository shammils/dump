/*
  retain the last drawn value
  on resize, redraw last value

  In order to draw a proper view for every occasion, a string with line breaks
  is no longer sufficient. We need an object with known properties for
  breadcrumbs, indicators, selectable items, etc
*/
let view

process.stdout.on('resize', () => {
  const dims = {
    width: process.stdout.columns,
    height: process.stdout.rows,
  }
  // redraw
  // draw(view)
})

const api = {
  menuConfiguration: {
    'Nan Ji': [
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
    'Kotoba': [
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
  }
}
module.exports = api
