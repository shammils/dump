const fs = require('fs-extra')

class Logger {
  constructor() {
    fs.ensureDirSync('./logs')
    fs.emptyDirSync('./logs')
    fs.ensureFileSync('./logs/log.txt')
    this.log('logger', 'debug', 'logs initialized')
  }
  log(module, level, message) {
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    const string = `${new Date().toISOString()}-[HP-${Math.round(used * 100) / 100}MB]-${module.toUpperCase()}-${level.toUpperCase()}: ${message}\n`
    fs.appendFileSync('./logs/log.txt', string, {encoding:'utf8'})
  }
}

module.exports = Logger
