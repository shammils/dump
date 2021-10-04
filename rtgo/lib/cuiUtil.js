/*
  cui.js CANNOT use lib/util.js due to its use of readline, and I never made a
  proper rtgo so I cant just update reference in once place
*/
const nodeUtil = require('util')
const EventEmitter = require('events').EventEmitter

const path = require('path')
const fs = require('fs-extra')

// termux と linux, それ だけ だ. まど は ぜんぜん しらないん です けど ね
const usingTermux = process.env.SHELL.includes('com.termux')

let _self
function log(level, message) { _self.emit("log",{module:'util',level,message})}

class Util {
  constructor() {
		_self = this
		EventEmitter.call(this)
	}
  delay(ms) {
    return new Promise(resolve =>
      setTimeout(() => resolve(), ms))
  }
  // TODO: support config object with added switches and knobs
  shaberu(text, lang) {
    if (usingTermux) {
      // only termux support
      spawn('termux-tts-speak', ['-l', lang, '-r', '0.7', text])
    } else {
      log({level:'info',message:`saying '${text}' in ${lang}!`})
    }
  }
  // TODO: R&D how to stop tts-speak. killing the process should work, but do it
  // right
  damare() {
    console.log('\ndamare Not implemented')
    process.exit(0)
    if (usingTermux) {
      // only termux support
      spawn('termux-tts-speak', ['-q'])
    } else {
      log({level:'info',message:`was just told to shut up, rude`})
    }
  }
  trim(string, maxLength, prependThingy) {
    if (!string || !string.length) return string
    if (string.length < maxLength) return string
    else {
      if (prependThingy) return `${string.substring(0, maxLength-4)}...`
      else return string.substring(0, maxLength)
    }
  }
  
}
nodeUtil.inherits(Util, EventEmitter)

module.exports = Util
