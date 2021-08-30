const chalk = require('chalk')
const Yonde = require('./yonde.js')
const yonde = new Yonde()

let debug = false

yonde.on('log', (log) => {
  switch (log.level) {
    case 'debug': {
      if (debug) console.log(chalk.blue(`${new Date().toISOString()}: ${log.message}`))
    } break
    case 'info': { console.log(`${new Date().toISOString()}: ${log.message}`) } break
    case 'warn': { console.log(chalk.yellow(`${new Date().toISOString()}: ${log.message}`)) } break
    case 'error': { console.log(chalk.red(`${new Date().toISOString()}: ${log.message}`)) } break
    default:
      throw `unsupported log level ${log.level}`
  }
})

;(async () => {
	await yonde.loadDefinitions()
	const res = await runSuite()
	console.log(`pass:${res.pass.length}, fail:${res.fail.length}. fails`,res.fail)
})()

async function runSuite() {
  const fail = []
  const pass = []
  
  let res = yonde.search('oi')
  if (res && res.atari && res.atari.action === 'retort') { pass.push(res.term) }
  else { fail.push(res.term) }
  
  res = yonde.search('what time is it')
  if (res && res.atari && res.atari.action === 'currentTime') { pass.push(res.term) }
  else { fail.push(res.term) }
  
  res = yonde.search('what')
  if (res && !res.atari) { pass.push(res.term) }
  else { fail.push(res.term) }
  
  return {pass,fail}
}