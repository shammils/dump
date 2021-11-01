const chalk = require('chalk')
const readline = require('readline')
readline.emitKeypressEvents(process.stdin)

if (process.stdin.isTTY) { process.stdin.setRawMode(true) }

process.stdin.on('keypress', (str, key) => {
  if (key.name === 'c' && key.ctrl) process.exit(0)
});

console.log('👉😡😂↕')
console.log(chalk.green.bold('▶ ⏸ '))
// #0: recording something or not
// #1: playing something or not
// #2: mode
// #3: location?

console.log(`▷|○|🔃|🏠`)
console.log(`▷ | ○ | 🔃 | 🏠`)
console.log(`▷○🔃🏠`)
console.log(`▷ ○ 🔃 🏠`)
console.log(`${chalk.white('▶')} ${chalk.white('●')} 🔃 🏠`)
console.log(`${chalk.green('▶')} ${chalk.red('●')} 🔤 🈴`)
console.log(`${chalk.green(' ▶ ')} ${chalk.red(' ● ')} ${' 🔤 '} ${chalk.underline('|🈴|')}`)
console.log(`${chalk.white.underline('|▶|')} ${chalk.red(' ● ')} ${' 🔤 '} ${' 🈴 '}`)
console.log(`${chalk.white.bold(' ▶ ')} ${chalk.white.underline('|●|')} ${' 🔤 '} ${' 🈴 '}`)
console.log(`${chalk.white(' ▶ ')} ${chalk.white(' ● ')} ${' 🔤 '} ${' 🈴 '}`)
console.log('checking if lengths are the same with and without chalk')
const withChalk = `${chalk.white(' ▶ ')} ${chalk.white(' ● ')} ${' 🔤 '} ${' 🈴 '}`
const withoutChalk = `${' ▶ '} ${' ● '} ${' 🔤 '} ${' 🈴 '}`
const lengthTest = `${' a '} ${' b '} ${' c '} ${' d '}`
console.log(withChalk, withChalk.length)
console.log(withoutChalk, withoutChalk.length)
console.log(lengthTest, lengthTest.length)
console.log('🈴', '🈴'.length, 'd', 'd'.length)
process.exit(0)
/*
  indicators for:
    - audio or speech is playing chalk.green.bold(▶)
    - audio/speech not playing   ▷
    - audio recording            chalk.red.bold(●)
    - audio not recording        ○

  modes:
    - interacting with overlay         🔒 🔒
    - interacting with not the overlay
      - navigation 🔃  ↕ 🖱
      - input      🔤 🔣 ⌨
      - game       🆚 🎮 🕹 🧩 🎲 🎰
      - more modes?
  future:
    - retail stuff 🛒
    - saving indicator 💾
    - error happened 🔥
      - rotate between these two 🧯🔥
  location-ish?
    - main menu 🏠 📋
    - benyou    📝 🈴(means passing grade)
    - settings  🛠 🔧
    - game?     🆚 🎮 🕹 🧩 🎲 🎰
      - gaming mode and game menu could be different


*/
