const nodeUtil = require('util')
const EventEmitter = require('events').EventEmitter

let _self
function log(level, message) { _self.emit("log",{module:'reports',level,message})}

class Reports {
  constructor() {
		_self = this
		EventEmitter.call(this)
	}
}
nodeUtil.inherits(Reports, EventEmitter)

module.exports = Reports
