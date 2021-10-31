const util = require('../lib/util.js')
const chalk = require('chalk')
const nodeUtil = require('util')
const EventEmitter = require('events').EventEmitter

let _self
function log(level, message) { _self.emit("log",{module:'settings',level,message})}

const buildMenu = (params) => {
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
    if (params[i].required) menuItem.required = params[i].required
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
      // boolean considered the same as input for now
      /*case util.menuItemTypes.boolean: {
        menuItem = {
          ...params[i]
        }
        if (menuItem.value == undefined) menuItem.value = false
      } break*/
      case util.menuItemTypes.input: {
        // screw it, im 1 to 1-ing this for now
        menuItem = {
          ...params[i]
        }
        if (params[i].inputType === util.menuItemTypes.boolean) {
          if (menuItem.value == undefined) menuItem.value = false
        } else {
          // we need to add the value to the input array if there is one
          // BUG: cant call .length on ints, sooooo yeah. fix someday
          if (menuItem.value != null) {
            menuItem.input = []
            for (let i = 0; i < menuItem.value.length; i++)
              menuItem.input.push(menuItem.value[i])
          }
        }
      } break
      default: {
        console.log(`Settings currently doesnt support menu item type '${params[i].type}'`)
        process.exit(500)
      } break
    }
    menu.options.push(menuItem)
  }
  // add start and go back option
  // ISSUE: there is no start for updating settings, only for configuring thing
  // before next step, so this needs to be a save, but we need to have a function
  // to call after
  /*menu.options.push({
    name: ' Start ->',
    type: 'function',
    handler: () => {
      console.log('TODO: implement start button when you know how settings navigation works')
      process.exit(0)
    },
  })
  menu.options.push({
    name: ' <- Go Back',
    type: 'function',
    handler: (menuStack, draw) => {
      console.log('clicked the back button')
      process.exit(0)
      menuStack.pop()
      draw()
    },
  })*/
  //console.log(JSON.stringify(menu, ' ', 2))
  //process.exit(0)
  return menu
}

class SettingsMenu {
  constructor(menuStack, params, successMenuItem, returnMenuItem) {
    _self = this
    this.name = 'Settings'
    this.menuStack = menuStack
    // TODO: save params locally if needed in the future

    this.currentRow = 0
    this.selected = null
    this.mode = util.modes.navigate
    // will be built dynamically depending on the data provided
    this.buildMenu = buildMenu
    this.menu = this.buildMenu(params)
    this.menu.options.push({
      name: successMenuItem.name,
      onSuccessOption: true, // set so we know when the user hovers over it
      type: 'function',
      handler: () => {
        this.validate(this.menu)
        if (this.errors.length) {
          //console.log('errors happened', this.errors)
          this.draw()
        } else {
          successMenuItem.handler(this.menu.options)
        }
      },
    })
    this.menu.options.push(returnMenuItem)
    this.menuStack.push(this.menu)
    this.errors = []
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
        if (this.selected.inputType === util.menuItemTypes.boolean) {
          // for now, it doesnt matter what key you hit if it isnt return, we
          // will flip the value
          this.selected.value = !this.selected.value
          this.draw()
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
      if (this.currentRow < this.menu.options.length-1) {
        this.currentRow += 1
      }
      if (this.selected) { }
      else { }
    }
    if (key.name === 'return') {
      if (!this.selected) {
        // handle functions first
        if (this.menu.options[this.currentRow].type === util.menuItemTypes.function) {
          this.menu.options[this.currentRow].handler()
          return
        }

        // handle all non functions when enter clicked and no options selected
        // yet
        this.selected = this.menu.options[this.currentRow]
        this.currentRow = 0
        if (this.selected.type === util.menuItemTypes.input) {
          this.mode = util.modes.input
        }
      } else {
        // return to the top level
        this.selected = null
      }
    }
    if (key.name === 'backspace') {
      if (this.selected) {
        // simulate go back for now?
        this.selected = null
        this.currentRow = 0
        this.mode = util.modes.navigate
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
      } else {
        // space and return should behave the same at the top level
        this.selected = this.menu.options[this.currentRow]
        this.currentRow = 0
      }
    }

    this.draw()
  }
  draw() {
    let text = ''
    // handle breadcrumbs
    // menuStack and stack should be treated the same in crumb case
    // add current option to the breadcrumps if applicable, but I dont want to
    // modify the actual menuStack array. I dont consider the selected option as
    // the same class as a menu item per say.
    const crumbs = this.selected ?
      util.createBreadcrumbs([...this.menuStack, {name:this.selected.name}]) :
      util.createBreadcrumbs(this.menuStack)
    if (crumbs) text += `${chalk.cyan.bold(crumbs)}\n`
    // handle rest
    if (this.selected) {
      // menu item selected, render specific item
      if (this.selected.type === util.menuItemTypes.input) {
        // handle booleans different only for now
        if (this.selected.inputType === util.menuItemTypes.boolean) {
          if (this.selected.value) text += `> ${chalk.green.bold(this.selected.value)}`
          else text += `> ${chalk.red.bold(this.selected.value)}`
        } else {
          // text, ints, everything else for now
          text += `> ${this.selected.value}`
        }
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
        // TODO: decorate it a bit
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

          // show errors if errors exist and user is hovering over 'submit'
          if (el.onSuccessOption && this.errors.length) {
            // replace the description
            description = chalk.red.bold(`errors: ${this.errors.join(', ')}\n`)
          }

          // dont show value on function types
          if (el.type === util.menuItemTypes.function) {
            tempText += chalk.underline.bold(`> ${el.name}'\n`)
          } else {
            if (selected.value != null) tempText += chalk.underline.bold(`> ${el.name} - '${selected.value}'\n`)
            else tempText += chalk.underline.bold(`> ${el.name} - null\n`)
          }
        } else {
          // dont show value on function types
          if (el.type === util.menuItemTypes.function) {
            tempText += `  ${el.name}'\n`
          } else {
            if (selected.value != null) tempText += `  ${el.name} - '${selected.value}'\n`
            else tempText += `  ${el.name} - null\n`
          }
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
      case util.menuItemTypes.select: {
        menuItem.options.forEach(el => {
          if (el.selected) {
            selected.value = el.value ?? el.name
          }
        })
      } break
      case util.menuItemTypes.multiSelect: {
        const selectedValues = []
        menuItem.options.forEach(el => {
          if (el.selected) {
            selectedValues.push(el.value ?? el.name)
          }
        })
        if (selectedValues.length) selected.value = selectedValues.join(',')
      } break
      // boolean now considered .input
      /*case util.menuItemTypes.boolean: {
        selected.value = menuItem.value
      } break*/
      case util.menuItemTypes.input: {
        selected.value = menuItem.value
      } break
    }
    return selected
  }
  reset() {
    this.currentRow = 0
    this.mode = util.modes.navigate
    this.selected = null
    this.draw()
  }
  validate(menu) {
    // Validation should happen during menuItem update too
    this.errors = []
    menu.options.forEach(el => {
      switch(el.type) {
        case util.menuItemTypes.multiSelect: {
          // if required, at least one should be selected, otherwise we dont care
          if (el.required) {
            let somethingSelected = false
            el.options.forEach(msi => {
              if (msi.selected) {
                somethingSelected = true
              }
            })
            if (!somethingSelected) this.errors.push(`'${el.name}' required`)
          }
        } break
        case util.menuItemTypes.select: {
          // if required, only one should be selected. if more than one selected,
          // thats the developer's fault for allowing that to happen, but lets
          // check it anyway
          if (el.required) {
            let selectedCount = 0
            el.options.forEach(si => {
              if (si.selected) {
                selectedCount += 1
              }
            })
            if (selectedCount === 0) this.errors.push(`'${el.name}' required`)
            else if (selectedCount > 1) this.errors.push(`'${el.name}' only one allowed`)
          }
        } break
        case util.menuItemTypes.input: {
          // required does not take precendence in this case. if the input only
          // accepts ints but alphanumeric is present, this is also the dev's
          // fauilt but check for it anyway
          if (el.required && el.value == null) {
            this.errors.push(`'${el.name}' required`)
            return
          }
          if (el.inputType === util.dataTypes.number) {
            // not sure if NaN works for decimals
            const num = parseInt(el.value);
            if (isNaN(num)) {
              this.errors.push(`${el.name}' is not a number`)
              return
            }
            if (el.min != null && el.min > num) {
              this.errors.push(`${el.name}' is less than the minimum value '${el.min}'`)
            }
            if (el.max != null && el.max < num) {
              this.errors.push(`${el.name}' is greater than the maximum value '${el.max}'`)
            }
          }
        } break
        case util.menuItemTypes.function: {
          // do nothing. leaving here just in case default does something in the
          // future. onSuccess and the back function should fall in here
        } break
        case util.menuItemTypes.menu: {
          // I think there should be no menus in this step, so lets just throw an
          // error for now
          console.log(`menu type not allowed as of now in settings`, menu)
          process.exit(500)
        } break
      }
    })
    return
  }
}
nodeUtil.inherits(SettingsMenu, EventEmitter)

module.exports = SettingsMenu
