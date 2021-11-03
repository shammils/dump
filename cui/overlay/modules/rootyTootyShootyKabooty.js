const chalk = require('chalk')
const nodeUtil = require('util')
const EventEmitter = require('events').EventEmitter
const util = require('../lib/util.js')
const ViewBuilder = require('../lib/viewBuilder.js')

let _self
function log(level, message) { _self.emit("log",{module:'RTSK',level,message})}

class RTSK {
  constructor(updateState, updateStack) {
    _self = this
    this.name = 'Rooty Tooty Shooty Kabooty'
    // functions to manipulate state & view
    this.updateState = updateState
    this.updateStack = updateStack

    this.currentMenuRow = 0
    //this.mode
    this.options = [
      {
        name: 'Start',
        type: util.menuItemTypes.function,
        handler: () => {
          this.state = this.stateOptions.playing
          this.intervalId = setInterval(() => {this.draw()}, 500)
        },
      },
      {
        name: 'Quit',
        type: util.menuItemTypes.function,
        handler: () => {
          if (this.intervalId) {
            clearInterval(this.intervalId)
            this.intervalId = null
          }
          // this probably doesnt mean shit at this point
          this.state = this.stateOptions.paused
          this.updateStack('remove')
        },
      }
    ]
    this.stateOptions = {
      paused: 'paused',
      playing: 'playing',
    }
    this.state = this.stateOptions.paused
    this.intervalId

    // game state
    this.posP1x = 0
    this.posP2x = 0 // not building player 2 just yet
  }
  onKeypress(str, key) {
    if (key.name === 'p') {
      clearInterval(this.intervalId)
      this.intervalId = null
      this.state = this.stateOptions.paused
    }
    this.navigate(key)
  }
  navigate(key) {
    if (this.state === this.stateOptions.paused) {
      // game is paused one way or another
      if (key.name === 'up') {
        if (this.currentMenuRow > 0) {
          this.currentMenuRow -= 1
        }
      }
      if (key.name === 'down') {
        if (this.currentMenuRow < this.options.length-1) {
          this.currentMenuRow += 1
        }
      }
      if (key.name === 'return') {
        this.options[this.currentMenuRow].handler()
      }
    } else {
      // only other option is 'playing', change this if it changes
      // game is being played
      if (key.name === 'left') {
        if (this.posP1x > 0) this.posP1x -= 1
      }
      if (key.name === 'right') {
        if (this.posP1x < process.stdout.columns) this.posP1x += 1
      }
      if (key.name === 'space') {
        // UUUUUTTEEEEEEEEEE
        // will need to wait a few frames, dont want gatling gun shots
        // TODO: animate bullets
      }
    }


    if (key.name === 'backspace') {
      if (this.stack.length > 1) {
        // changing modes might not always be the right choice when clicking back
        // but I cant think of any issues atm
        this.mode = util.modes.navigate
        // remove the last menu item from the stack
        this.stack.pop()
        // TODO: remember the last currentRow value so the user isnt back to the
        // top of the previous menu
        this.currentRow = 0
      }
    }
    this.draw()
  }
  draw() {
    log('debug', `drawing: ${this.posP1x}, ${process.stdout.rows} ${process.stdout.columns}`)
    const vb = new ViewBuilder('raw')
    const row = {type:'raw',text:''} // type is broken, I know
    if (this.state === this.stateOptions.paused) {
      // draw menu
      const menu = { type:'menu', options:[]}
      for (let i = 0; i < this.options.length; i++) {
        menu.options.push({
          name: this.options[i].name,
          selected: this.currentMenuRow === i,
        })
      }
      vb.append(menu)
    } else {
      // draw game. will have to draw the entire board in this loop
      for (let i = 0; i < process.stdout.rows; i++) {
        // lets make ourselves a pixel/block for now
        if (i === process.stdout.rows-2) {
          row.text += `drawing: ${this.posP1x}, ${process.stdout.rows} ${process.stdout.columns}`
        }
        if (i === process.stdout.rows-1) {
          let text = ''
          for (let j = 0; j < process.stdout.columns; j++) {
            if (j === this.posP1x) text += `${chalk.red.bold('█')}`
            else text += ' '
          }
          row.text += text
        } else {
          row.text += '\n'
        }
      }
      vb.append(row)
    }
    this.updateState('currentView', vb)
  }
}
nodeUtil.inherits(RTSK, EventEmitter)

module.exports = RTSK
