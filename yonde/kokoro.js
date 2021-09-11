const nodeUtil = require('util')
const EventEmitter = require('events').EventEmitter
// TODO: manage context. can only do this once yonde is responding somewhat properly
let currentContext
let _self

function log(level, message) { _self.emit("log",{module:'kokoro',level,message})}

class Kokoro {
	constructor() {
		_self = this
		EventEmitter.call(this)
		//this.definitions = []
	}
	kangaeru(obj) {
		console.log('-- Kokoro ga kangaiteimasu ne')
		if (obj.atari) {
		  return respond(obj)
		} else {
		  // no direct hit, try to determine what inquirer wants
		  return 'koko ni wa dame da'
		}
	}
}

function respond(obj) {
  switch (obj.atari.action) {
    case 'retort': {
      const torts = ['what', 'nanika', 'nan da']
      return torts[Math.floor(Math.random() * torts.length)]
    } break
    case 'websiteSales': {
      return 'on website sales'
    } break
    default: {
      return 'sono mele ga wakarimasen'
    } break
  }
}
function determineIntentions(obj) {

}
nodeUtil.inherits(Kokoro, EventEmitter)

module.exports = Kokoro
