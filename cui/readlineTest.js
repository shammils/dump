const readline = require('readline')
readline.emitKeypressEvents(process.stdin)
if (process.stdin.isTTY) { process.stdin.setRawMode(true) }
process.stdin.on('keypress', (str, key) => {
  console.log(key)
  if (key.name === 'escape') process.exit(0)
})
