const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
})

rl.prompt()
rl.on('line', handle)

function handle(ln) {
  console.log(`you typed '${ln}'`)
  determineIntention(ln)
}
function determineIntention(ln) {
  if (!ln || ln === 'yo') {
    actions.retort()
  } else {
    console.log('unrecognized command')
  }
}
const actions = {
  retort: async () => {
    const torts = ['what', 'nanika', 'nan da']
    console.log(torts[Math.floor(Math.random() * torts.length)])
  }
}
