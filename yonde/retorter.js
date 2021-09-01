const fs = require('fs')
const klaw = require('klaw')
const path = require('path')
const nodeUtil = require('util')
const EventEmitter = require('events').EventEmitter
// TODO: manage context. can only do this once yonde is responding somewhat properly
let currentContext
let _self

function log(level, message) { _self.emit("log",{module:'yonde',level,message})}

class Retorter {
	constructor() {
		_self = this
		EventEmitter.call(this)
		//this.definitions = []
	}
	deliberate()
}

nodeUtil.inherits(Yonde, EventEmitter)

module.exports = Yonde
