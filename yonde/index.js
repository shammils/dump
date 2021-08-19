const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
})

rl.prompt()
rl.on('line', handle)

function handle(line) {
  console.log(`you typed '${line}'`)
}

function getDefs() {
  return {
    
  }
}
