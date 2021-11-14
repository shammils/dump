const chalk = require('chalk')
const util = require('../lib/util.js')
const ViewBuilder = require('../lib/viewBuilder.js')
const nodeUtil = require('util')
const EventEmitter = require('events').EventEmitter
const yonde = {
  request: async (text) => {
    await util.delay(1000)
    return {
      value: `I am responding to your request ${new Date().toISOString()}`
    }
  }
}

class KakeruMenu {
  constructor(updateState, updateStack, onLog) {
    this.name = 'Kakeru'
    this.updateState = updateState
    this.updateStack = updateStack
    this.onLog = onLog
    this.log = (level, message) => { this.onLog('kakeru', level, message) }
    this.input = []
    this.data = util.getKakeruData()
  }
  async request(val) {
    const response = await yonde.request(val)
    this.data.conversation.push({
      speaker: 'aibo',
      value: response.value,
      date: new Date().toISOString(),
    })
    util.saveKakeruData(this.data)
    this.draw()
  }
  onKeypress(str, key) {
    // handle alphanumeric
    if (key.name && key.name.length === 1) this.input.push(key.sequence)
    // handle special chars
    if (!key.name && key.sequence.length === 1) this.input.push(key.sequence)
    // backspace
    if (key.name === 'backspace') this.input.pop()
    if (key.name === 'space') this.input.push(' ')
    if (key.name === 'return') {
      this.data.conversation.push({
        speaker: 'ore',
        value: this.input.join(''),
        date: new Date().toISOString(),
      })
      this.request(this.input.join(''))
      this.input.length = 0
    }
    //this.navigate(key)
    this.draw()
  }
  //navigate(key) { }
  draw() {
    const vb = new ViewBuilder('list')
    // add current input
    vb.append({ type: 'static', value: `> ${this.input.join('')}`, style: 'bold' })
    // add divider
    vb.append({ type: 'static', value: '====================', style: 'bold' }) // temporary
    if (!this.data.conversation.length) vb.append({type:'static',value:'Nanika Yeyo'})
    this.data.conversation.forEach(c => {
      vb.append({ type: 'static', value: c.value, style: c.speaker })
    })
    this.updateState('currentView', vb)
  }
}

module.exports = KakeruMenu
