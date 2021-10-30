const util = require('../lib/util.js')
const chalk = require('chalk')
const nodeUtil = require('util')
const EventEmitter = require('events').EventEmitter

let _self
function log(level, message) { _self.emit("log",{module:'settings',level,message})}

// TODO: implement the google record, play and google cloud integration code

function buildMenu(params) {
  const menu = {
    name: 'Settings',
    type: util.menuItemTypes.menu,
    options: []
  }
  for (let i = 0; i < params.length; i++) {
    let menuItem = {
      name: params[i].name,
      type: params[i].type,
    }
    if (params[i].description) menuItem.description = params[i].description
    switch (params[i].type) {
      case util.menuItemTypes.multiSelect: {
        // at the time of writing, the param options passed to this method is 1
        // to 1 as menu multi select options so we dont need to map, but this
        // might not always be the case so transform it(even if it stll stays
        // 1 to 1).
        menuItem.options = params[i].options.map(o => {
          // add the selected prop if it doesnt exist
          if (!o.selected) o.selected = false
          return o
        })
      } break
      case util.menuItemTypes.select: {
        menuItem.options = params[i].options.map(o => {
          if (!o.selected) o.selected = false
          return o
        })
      } break
      case util.menuItemTypes.boolean: {
        menuItem = {
          ...params[i]
        }
        if (menuItem.value == undefined) menuItem.value = false
      } break
      case util.menuItemTypes.input: {
        // screw it, im 1 to 1-ing this for now
        menuItem = {
          ...params[i]
        }
      } break
      default: {
        console.log(`Settings currently doesnt support menu item type '${params[i].type}'`)
        process.exit(500)
      } break
    }
    menu.options.push(menuItem)
  }
  // add go back option
  menu.options.push({
    name: ' <- Go Back',
    type: 'function',
    handler: () => {
      console.log('TODO: implement back button when you know how settings navigation works')
      process.exit(0)
    },
  })
  //console.log(JSON.stringify(menu, ' ', 2))
  //process.exit(0)
  return menu
}

// Validation should happen during menuItem update too
function validate() {}

class SettingsMenu {
  constructor(menuStack, render, params) {
    _self = this
    this.name = 'Settings'
    this.menuStack = menuStack
    this.render = render
    // TODO: save params locally if needed in the future

    this.currentRow = 0
    this.selected = null
    this.mode = util.modes.navigate
    // will be built dynamically depending on the data provided
    this.menu = buildMenu(params)
    this.menuStack.push(this.menu)
  }
  init() {}
  onKeypress(str, key) {
    if (key.name === 'escape') process.exit(0)
    // does mode.multiSelect include menuItemType.select??? prolly not
    if (this.mode === util.modes.navigate || this.mode === util.modes.multiSelect) {
      this.navigate(key)
    } else if (this.mode === util.modes.input && this.selected) {
      if (key.name === 'return') {
        this.reset()
      } else {
        if (this.selected.type === util.menuItemTypes.boolean) {
          // for now, it doesnt matter what key you hit if it isnt return, we
          // will flip the value
          this.selected.value = !this.selected.value
          return
        }

        if (!this.selected.input) this.selected.input = []
        // TODO: handle capitalization. Im sure there are other fucky cases due
        // to this implementation
        // TODO: number only handling goes here

        // handle alphanumeric
        if (key.name && key.name.length === 1) this.selected.input.push(key.sequence)
        // handle special chars
        if (!key.name && key.sequence.length === 1) this.selected.input.push(key.sequence)
        // backspace
        if (key.name === 'backspace') this.selected.input.pop()
        if (key.name === 'space') this.selected.input.push(' ')
        // update the intended property
        this.selected.value = this.selected.input.join('')
        this.draw()
      }
    }
  }
  navigate(key) {
    if (key.name === 'up') {
      if (this.currentRow > 0) {
        this.currentRow -= 1
      }
    }
    if (key.name === 'down') {
      if (this.selected) {
        // ???
      } else {
        if (this.currentRow < this.menu.options.length-1) {
          this.currentRow += 1
        }
      }
    }
    if (key.name === 'return') {
      if (!this.selected) {
        this.selected = this.menu.options[this.currentRow]
        this.currentRow = 0
      }
    }
    if (key.name === 'backspace') {
      if (this.selected) {
        // simulate go back for now?
        this.selected = null
        this.currentRow = 0
      } else {
        // exit the settings class
      }
    }
    if (key.name === 'space') {
      if (this.selected) {
        if (this.selected.type === util.menuItemTypes.multiSelect) {
          this.selected.options[this.currentRow].selected = !this.selected.options[this.currentRow].selected
        }
        if (this.selected.type === util.menuItemTypes.select) {
          // deselect everything elses
          this.selected.options.forEach((el, i) => {
            if (i === this.currentRow) el.selected = !el.selected
            else el.selected = false
          })
        }
      }
    }

    this.draw()
  }
  navigateBad(key) {
    const menuItem = this.stack[this.stack.length-1]
    const current = menuItem.options[this.currentRow]
    if (key.name === 'up') {
      if (this.currentRow > 0) {
        this.currentRow -= 1
      }
    }
    if (key.name === 'down') {
      if (this.currentRow < menuItem.options.length-1) {
        this.currentRow += 1
      }
    }
    if (key.name === 'return') {
      if (this.mode === util.menuItemTypes.multiSelect) {
        this.mode = util.modes.navigate
        this.stack.pop()
        this.currentRow = 0
      } else {
        switch(current.type) {
          case util.menuItemTypes.function: {
            current.handler()
          } break
          case util.menuItemTypes.select: {
            this.stack.push(current)
          } break
          case util.menuItemTypes.multiSelect: {
            this.mode = util.modes.multiSelect
            this.currentRow = 0
            this.stack.push(current)
          } break
        }
      }
    }
    if (key.name === 'backspace') {
      if (this.stack.length > 1) {
        this.mode = util.modes.navigate
        this.stack.pop()
        this.currentRow = 0
      }
    }
    if (key.name === 'space') {
      if (menuItem.type === util.menuItemTypes.multiSelect) {
        menuItem.options[this.currentRow].selected = !menuItem.options[this.currentRow].selected
      }
      if (menuItem.type === util.menuItemTypes.select) {
        // deselect everything elses
        menuItem.options.forEach((el, i) => {
          if (i === this.currentRow) el.selected = !el.selected
          else el.selected = false
        })
      }
    }

    this.draw()
  }
  draw() {
    let text = ''
    // handle breadcrumbs
    // menuStack and stack should be treated the same in crumb case
    const crumbs = util.createBreadcrumbs(this.menuStack)
    if (crumbs) text += `${chalk.cyan.bold(crumbs)}\n`
    // handle rest
    if (this.selected) {
      // menu item selected, render specific item
      if (this.selected.type === util.menuItemTypes.input) {
        text += `> ${this.selected.value}`
      }
      if (this.selected.type === util.menuItemTypes.boolean) {
        if (this.selected.value) text += `> ${chalk.green.bold(this.selected.value)}`
        else text += `> ${chalk.red.bold(this.selected.value)}`
      }
      if (this.selected.type === util.menuItemTypes.menu) {
        for (let i = 0; i < this.selected.options.length; i++) {
          if (this.currentRow === i) {
            text += chalk.underline.bold(`> ${this.selected.options[i].name}\n`)
          } else {
            text += `  ${this.selected.options[i].name}\n`
          }
        }
      }
      if (this.selected.type === util.menuItemTypes.select ||
      this.selected.type === util.menuItemTypes.multiSelect) {
        text += `> ${chalk.green(this.selected.name)}\n`
        for (let i = 0; i < this.selected.options.length; i++) {
          const selected = this.selected.options[i].selected ? '•' : '◦'
          if (this.currentRow === i) {
            text += chalk.underline.bold(` > ${selected} ${this.selected.options[i].name}\n`)
          } else {
            text += ` > ${selected} ${this.selected.options[i].name}\n`
          }
        }
      }

    } else {
      // nothing selected, render menu
      let description = 'description: '
      let tempText = ''
      this.menu.options.forEach((el, i) => {
        const selected = this.getMenuItemValue(el)
        // lets decorate it a bit
        let value
        if (selected.value) {
          switch (selected.type) {
            case util.menuItemTypes.input: {} break
            case util.menuItemTypes.select: {} break
            case util.menuItemTypes.boolean: {} break
          }
        }
        if (this.currentRow === i) {
          if (el.description) description += `${util.trim(el.description, 50, true)}\n`
          else description += `\n` // still need to add the newline
          if (selected.value != null) tempText += chalk.underline.bold(`> ${el.name} - '${selected.value}'\n`)
          else tempText += chalk.underline.bold(`> ${el.name} - null\n`)
        } else {
          if (selected.value != null) tempText += `  ${el.name} - '${selected.value}'\n`
          else tempText += `  ${el.name} - null\n`
        }
      })
      text += description
      text += tempText
    }

    util.print(text)
  }
  getMenuItemValue(menuItem) {
    let selected = {
      type: menuItem.type,
    }
    switch (menuItem.type) {
      // TODO: will need to handle multiple values in the case of multi selects
      case util.menuItemTypes.select:
      case util.menuItemTypes.multiSelect: {
        menuItem.options.forEach(el => {
          if (el.selected) {
            selected.value = el.value ?? el.name
          }
        })
      } break
      case util.menuItemTypes.boolean: {
        selected.value = menuItem.value
      } break
      case util.menuItemTypes.input: {
        selected.value = menuItem.value
      } break
    }
    return selected
  }
  reset() {
    this.currentRow = 0
    this.stack.length = 0
    this.mode = util.modes.navigate
    this.draw()
  }
}
nodeUtil.inherits(SettingsMenu, EventEmitter)

module.exports = SettingsMenu
