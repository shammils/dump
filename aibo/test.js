

kanjiSettings()
async function kanjiSettings() {
  const SettingsMenu = require('./menus/settings.js')
  const settingsMenu = new SettingsMenu(
    [{name:'Main'},{name:'Renshuu'},{name:'Kotoba'}],
    () => {},
    [
      {
        // automatically add a 'select all' option. if all are selected, switch
        // it to the opposite. (deselect all?)
        name: 'Level',
        description: 'Defined by some outside force',
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
        type: 'boolean',
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
        inputType: 'integer',
        min: 0,
        value: 0,
        // no way for us to know max unless we know how many possible options are
        // available at the given time
        // max: ?
        required: true,
      }
    ]
  )
  settingsMenu.draw()
  process.stdin.on('keypress', (str, key) => {
    if (key.name === 'escape') process.exit(0)
    settingsMenu.onKeypress(str, key)
  })
}
