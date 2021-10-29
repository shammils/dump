const util = require('../lib/util.js')
const chalk = require('chalk')
const nodeUtil = require('util')
const EventEmitter = require('events').EventEmitter
const spawn = require('child_process').spawn
const fs = require('fs-extra')

let _self
function log(level, message) { _self.emit("log",{module:'translate',level,message})}

// TODO: implement the google record, play and google cloud integration code

class TranslateMenu {
  constructor(menuStack, render) {
    _self = this
    this.name = 'Translate'
    this.menuStack = menuStack
    this.render = render

    this.currentRow = 0
    this.selectedOption = null

    this.recording = false
    this.processing = false
    this.playing = false
    this.audioProcess = null
    this.menu = {
      'にほんご まで to english': {
        from: 'ja-JP',
        to: 'en-US'
      },
      'from english にほんご に': {
        from: 'en-US',
        to: 'ja-JP',
      },
    }
    this.menuArr = Object.keys(this.menu)
    this.secondaryMenu = [
      'おわた',
      //'やりなおし',
      'とまれ',
    ]
    this.logStream = []
    this.maxLogLength = 10
  }
  async init() {
    await fs.ensureDir('./temp')
    await fs.emptyDir('./temp')
    this.draw()
  }
  async navigate(key) {
    if (key.name === 'up') {
      if (this.currentRow > 0) {
        this.currentRow -= 1
      }
    }
    if (key.name === 'down') {
      if (this.selectedOption) {
        if (this.currentRow < this.secondaryMenu.length-1) {
          this.currentRow += 1
        }
      } else {
        if (this.currentRow < this.menuArr.length-1) {
          this.currentRow += 1
        }
      }
    }
    if (key.name === 'return') {
      if (this.selectedOption) {
        if (this.currentRow === 0) {
          //await stopRecord()
          //await submit()
        } else {
          // only 2 options atm
          //await stopRecord()
          //reset()
          // clean up audio files
          await fs.emptyDir('./temp')
        }
      } else {
        this.selectedOption = this.menuArr[this.currentRow]
        this.currentRow = 0
        //startRecord()
      }
    }
    if (key.name === 'backspace') {
      // go to parent menu if applicable
      if (this.menuStack && this.menuStack.length &&
      this.render && typeof this.render === 'function') {
        this.menuStack.pop()
        this.render()
        return
      }
    }
    //if (key.name === 'space') {}
    this.draw()
  }
  draw() {
    let text = ''
    // handle breadcrumbs
    const crumbs = util.createBreadcrumbs(this.menuStack)
    if (crumbs) text += `${chalk.cyan.bold(crumbs)}\n`
    if (this.selectedOption) {
      text += chalk.bold(`${this.selectedOption}\n`)
      //for (let i = 0; i < secondaryMenu.length; i++) {}
      switch (this.currentRow) {
        case 0: {
          text += chalk.green.bold(`> ${this.secondaryMenu[0]}\n`)
          text += chalk.red(`  ${this.secondaryMenu[1]}`)
        } break
        case 1: {
          text += chalk.green(`  ${this.secondaryMenu[0]}\n`)
          text += chalk.red.bold(`> ${this.secondaryMenu[1]}`)
        } break
      }
    } else {
      for (let i = 0; i < this.menuArr.length; i++) {
        if (this.currentRow === i) {
          text += chalk.underline.bold(`> ${this.menuArr[i]}\n`)
        } else {
          text += `  ${this.menuArr[i]}\n`
        }
      }
    }
    util.print(text)
  }
  reset() {
    this.selectedOption = null
    this.currentRow = 0
    this.draw()
  }
}
nodeUtil.inherits(TranslateMenu, EventEmitter)

module.exports = TranslateMenu
