const chalk = require('chalk')
const nodeUtil = require('util')
const EventEmitter = require('events').EventEmitter
const util = require('../lib/util.js')
const ViewBuilder = require('../lib/viewBuilder.js')

let _self
//function log(level, message) { _self.emit("log",{module:'RTSK',level,message})}

class RTSK {
  constructor(updateState, updateStack, onLog) {
    _self = this
    this.name = 'Rooty Tooty Shooty Kabooty'
    this.onLog = onLog
    this.log = (level, message) => { this.onLog('RTSK', level, message) }
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
          this.intervalId = setInterval(() => {this.draw()}, 50)
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

    this.p1Shots = []
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
        // how about 1 shot at a time for now
        if (!this.p1Shots.length) {
          this.p1Shots.push({
            column: this.posP1x,
            row: process.stdout.rows-2
          })
          this.log('debug', `shot added ${this.p1Shots.length}`)
        }
      }
      // drawing on keypress for debugging
      //this.draw()
    }
  }
  draw() {
    if (this.state === this.stateOptions.paused) {
      const vb = new ViewBuilder('list')
      // draw menu
      const menu = { type:'menu', options:[]}
      for (let i = 0; i < this.options.length; i++) {
        menu.options.push({
          name: this.options[i].name,
          selected: this.currentMenuRow === i,
        })
      }
      vb.append(menu)
      this.updateState('currentView', vb)
    }
    if (this.state === this.stateOptions.playing) {
      // draw game. will have to draw the entire board in this loop
      //this.log('debug', `drawing: ${this.posP1x}, ${process.stdout.rows} ${process.stdout.columns}`)
      const vb = new ViewBuilder('raw')
      const row = {type:'raw',text:''} // type is broken, I know
      for (let i = 0; i < process.stdout.rows; i++) {
        // add some generic info
        //if (i === process.stdout.rows-2) {
        //  row.text += `drawing: ${this.posP1x}, ${process.stdout.rows} ${process.stdout.columns}`
        //}

        // animate player 1
        if (i === process.stdout.rows-1) {
          let text = ''
          for (let j = 0; j < process.stdout.columns; j++) {
            // lets make ourselves a pixel/block for now
            if (j === this.posP1x) text += `${chalk.red.bold('█')}`
            else text += ' '
          }
          row.text += text
        } else {

          // animate player 1 shots
          for (let j = 0; j < this.p1Shots.length; j++) {
            if (this.p1Shots[j].row === i) {
              //this.log('debug', `encountered shot: ${i}-${JSON.stringify(this.p1Shots[j])}`)
              this.p1Shots[j].row -= 1
              if (this.p1Shots[j].row < 1) {
                this.p1Shots.pop()
              } else {
                // now we need to put the shot in the right column
                let text = ''
                for (let k = 0; k < process.stdout.columns; k++) {
                  if (k === this.p1Shots[j].column) text += `${chalk.red.bold('º')}`
                  else text += ' '
                }
                row.text += `${text}\n`
                // continue so we dont hit the row.text at the end of this
                // execution block
                continue
              }
            }
          }

          /*for (let j = this.p1Shots.length; j >= 0; j--) {

            if (this.p1Shots[j]) {
              this.log('debug', `encountered shot: ${i}-${JSON.stringify(this.p1Shots[j])}`)
              if (this.p1Shots[j].row < 1) {
                this.p1Shots.pop()
              } else {
                if (this.p1Shots[j].row === i) {
                  this.log('debug', `animating shot ${i}-${this.p1Shots[j].row}`)
                  process.exit(0)
                  // now we need to put the shot in the right column
                  let text = ''
                  for (let k = 0; k < process.stdout.columns; k++) {
                    if (k === this.p1Shots[j].column) text += `${chalk.red.bold('º')}`
                    else text += ' '
                  }
                  row.text += `${text}\n`
                  // continue so we dont hit the row.text at the end of this
                  // execution block
                  this.p1Shots[j].row -= 1
                  continue
                }
              }
            }
          }*/

          row.text += '\n'

        }
      }
      // crazy as fuck bug with duplicating overlays trying to use this class and
      // overlays at the same time(and playing mode of course). hijack screen
      // entirely for now
      //vb.append(row)
      //this.updateState('currentView', vb)
      console.clear()
      process.stdout.write(row.text)
    }
  }
}
nodeUtil.inherits(RTSK, EventEmitter)

module.exports = RTSK
