const util = require('../lib/util.js')
const chalk = require('chalk')
const nodeUtil = require('util')
const EventEmitter = require('events').EventEmitter
const spawn = require('child_process').spawn
const fs = require('fs-extra')

let _self
function log(level, message) { _self.emit("log",{module:'translate',level,message})}

class TranslateMenu {
  constructor() {
    _self = this
    this.currentRow = 0
    this.selectedOption = null

    this.recording = false
    this.processing = false
    this.playing = false
    this.audioProcess = null
    this.menu = {
      //'にほんご   まで   にほんご',
      'にほんご   まで   えいご': {
        from: 'ja-JP',
        to: 'en-US'
      },
      'えいご     まで   にほんご': {
        from: 'en-US',
        to: 'ja-JP',
      },
      //'えいご     まで   えいご',
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
  navigate(key) {
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
        if (this.currentRow < this.mainMenuArr.length-1) {
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
        this.selectedOption = this.mainMenuArr[this.currentRow]
        this.currentRow = 0
        //startRecord()
      }
    }
    if (key.name === 'backspace') {
      // this is where we go back to the parent menu
    }
    //if (key.name === 'space') {}
    this.draw()
  }
  draw() {
    let text = ''
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
      for (let i = 0; i < this.mainMenuArr.length; i++) {
        if (this.currentRow === i) {
          text += chalk.underline.bold(`> ${this.mainMenuArr[i]}\n`)
        } else {
          text += `  ${this.mainMenuArr[i]}\n`
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
