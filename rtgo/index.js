const chalk = require('chalk')
const fs = require('fs-extra')
const Util = require('./lib/cuiUtil.js')
const util = new Util()
const Shopify = require('./lib/shopify.js')
const shopify = new Shopify()
const Reports = require('./lib/reports.js')
const reports = new Reports()

const readline = require('readline')
readline.emitKeypressEvents(process.stdin)

if (process.stdin.isTTY) { process.stdin.setRawMode(true) }

process.stdin.on('keypress', (str, key) => {
  if (key.name === 'escape') process.exit(0)
  if (mode === 'navigate' || mode === 'multi-select') {
    if (!processing) navigate(key)
  }
  else if (mode === 'input') {
    if (key.name === 'return') {
      mode = 'navigate'
      draw()
    } else {
      // handle alphanumeric
      if (key.name && key.name.length === 1) input.push(key.sequence)
      // handle special chars
      if (!key.name && key.sequence.length === 1) input.push(key.sequence)
      // backspace
      if (key.name === 'backspace') input.pop()
      // space bar
      if (key.name === 'space') input.push(' ')
      print(`> ${input.join('')}`)
    }
  }
});

const logStream = []
const notes = {} // will be displayed on corresponding page
let storeInfo // self explanitory
const maxLogLength = 1000 // TODO: setting variable
const maxLogViewSize = 10 // how many to show
util.on('log', log)
shopify.on('log', log)
reports.on('log', log)
// im not printing which module the log comes from??
function log(log) {
  switch (log.level) {
    case 'debug': { logStream.push(chalk.blue(`${new Date().toISOString()}: ${log.message}`)) } break
    case 'info': { logStream.push(`${new Date().toISOString()}: ${log.message}`) } break
    case 'warn': { logStream.push(chalk.yellow(`${new Date().toISOString()}: ${log.message}`)) } break
    case 'error': { logStream.push(chalk.red(`${new Date().toISOString()}: ${log.message}`)) } break
    default: {
      console.log(`\nunsupported log level ${log.level}, message: ${log.message}`)
      process.exit(500)
    } break
  }
  if (logStream.length > maxLogLength) logStream.shift()
  draw()
}

let mode = 'navigate'
let processing = false // unused atm
let currentRow = 0
const stack = []

// TODO: move menu into its own class(or something)
const mainMenu = {
  name: 'home',
  type: 'menu',
  options: [
    {
      name: 'Sync',
      type: 'menu',
      options: [
        {
          name: 'Sync Products',
          type: 'function',
          handler: syncProducts
        },
        {
          name: 'Sync Orders',
          type: 'function',
          handler: async () => {

          }
        },
        {
          name: '<- Back',
          type: 'function',
          handler: goBack
        }
      ]
    },
    {
      name: 'Reports',
      type: 'menu',
      options: [
        {
          name: 'All(Audio)',
          type: 'function',
          handler: async () => {

          }
        },
        {
          name: 'Products General(Audio)',
          type: 'function',
          handler: generateProductReport
        },
        {
          name: 'Orders General(Audio)',
          type: 'function',
          handler: async () => {
            /*
              - how many orders
                - last day
                - last week
                - last month
                - all time
              - include money in the above
              - which product sold the most
              - last product sold
              - etc
            */
          }
        },
        {
          name: 'Products Simple(Audio)',
          type: 'function',
          handler: async () => {
            /*
              idk, just how many orders total for now
            */
          }
        },
      ]
    },
    {
      name: 'Update Settings',
      type: 'function',
      handler: updateSettings
    },
    {
      name: 'View Logs',
      type: 'function',
      handler: viewLogs
    },
    {
      name: 'Quit',
      type: 'function',
      handler: () => {
        console.log('bye')
        process.exit(0)
      }
    }
  ]
}

;(async () => {
  await onStart()
  stack.push(mainMenu)
  draw()
})()

function navigate(key) {
  let menuItem = stack[stack.length-1]
  current = menuItem.options[currentRow]
  if (key.name === 'up') {
    if (currentRow > 0) {
      currentRow -= 1
    }
  }
  if (key.name === 'down') {
    if (currentRow > 0) {
      console.log(current)
    }
    if (currentRow < menuItem.options.length-1) {
      currentRow += 1
    }
  }
  if (key.name === 'return') {
    if (mode === 'multi-select') {
      mode = 'navigate'
      stack.pop()
      currentRow = 0
    } else {
      switch(current.type) {
        case 'function': {
          current.handler()
        } break
        case 'select': {
          stack.push(current)
          currentRow = 0
        } break
        case 'menu': {
          stack.push(current)
          currentRow = 0
        } break
        case 'multi-select': {
          mode = 'multi-select'
          stack.push(current)
          currentRow = 0
        } break
      }
    }
  }
  if (key.name === 'backspace') {
    if (stack.length > 1) {
      mode = 'navigate'
      stack.pop()
      currentRow = 0
    }
  }
  if (key.name === 'space') {
    if (menuItem.type === 'multi-select') {
      menuItem.options[currentRow].selected = !menuItem.options[currentRow].selected
    }
  }

  draw()
}

function draw() {
  let text = ''
  // render breadcrumbs
  if (stack.length > 1) {
    const crumbArr = []
    for (let i = 1; i < stack.length; i++) {
      crumbArr.push(util.trim(stack[i].name, 20, true))
    }
    text += `${chalk.cyan.bold(crumbArr.join(' > '))}\n`
  } else {
    text += chalk.cyan.bold('HOME\n')
  }
  const current = stack[stack.length-1]
  // render notes
  if (notes[current.name]) {
    text += `${notes[current.name].join(', ')}\n`
  } else {
    text += '\n' // add line break anyway
  }
  // render menu
  if (current.type === 'menu') {
    for (let i = 0; i < current.options.length; i++) {
      if (currentRow === i) {
        text += chalk.underline.bold(`> ${current.options[i].name}\n`)
      } else {
        text += `  ${current.options[i].name}\n`
      }
    }
  }
  if (current.type === 'multi-select') {
    text += `> ${chalk.green(current.name)}\n`
    for (let i = 0; i < current.options.length; i++) {
      const selected = current.options[i].selected ? '•' : '◦'
      if (currentRow === i) {
        text += chalk.underline.bold(` > ${selected} ${current.options[i].name}\n`)
      } else {
        text += ` > ${selected} ${current.options[i].name}\n`
      }
    }
  }
  // append log stream
  if (logStream.length) {
    const logBatch = logStream.slice(logStream.length-maxLogViewSize, logStream.length)
    text += '\n___________\n'
    for (let i = 0; i < logBatch.length; i++) text += `${logBatch[i]}\n`
    text += '\n___________\n'
  }
  print(text)
}

function print(message) {
  console.clear()
  readline.clearLine(process.stdout, 0)
  readline.cursorTo(process.stdout, 0)
  process.stdout.write(message)
}

function reset() {
  stack.splice(1)
  currentRow = 0
  processing = false
  mode = 'navigate'
  draw()
}

async function onStart() {
  await fs.ensureDir('./data')
  // make sure env vars are set
  const messages = []
  if (!process.env.SHOPIFYAPIKEY) messages.push(chalk.red.bold(`missing SHOPIFYAPIKEY env var`))
  if (!process.env.SHOPIFYPASSWORD) messages.push(chalk.red.bold(`missing SHOPIFYPASSWORD env var`))
  if (!process.env.SHOPIFYSTORENAME) messages.push(chalk.red.bold(`missing SHOPIFYSTORENAME env var`))
  if (messages.length) {
    addNotes('home', messages)
    return
  }
  // check for info.json. if it doesnt exist, create it
  if (!fs.existsSync('./data/storeInfo.json')) {
    messages.push('No info.json file, sync data first')
    // TODO: move this obj to util
    storeInfo = {
      products: {
        updated: null,
        count: null,
      },
      orders: {
        updated: null,
        count: null,
      }
    }
    await fs.writeJson('./data/storeInfo.json', storeInfo, {spaces:2})
  } else {
    storeInfo = await fs.readJson('./data/storeInfo.json')
    updateHomepageNotes()
  }

}

async function syncProducts() {
  if (!storeInfo.products.updated) {
    log({level:'info',message:`syncing all products`})
    // fetch all, replace whatever is on disk
    const products = await shopify.getProducts()
    productIds = products.map(x => x.id)
    await fs.writeJson('./data/products.json', products)
    log({level:'debug',message:`retrieved ${products.length} from shopify`})
    storeInfo.products.updated = new Date().toISOString()
    storeInfo.products.count = products.length
    await fs.writeJson('./data/storeInfo.json', storeInfo, {spaces:2})
  } else {
    log({level:'info',message:`syncing products updated after ${storeInfo.products.updated}`})
    let productsOnDisk = await fs.readJson('./data/products.json')
    log({level:'info',message:`Found ${productsOnDisk.length} products on disk`})
    // create temporary lookup obj
    let tempObj = {}
    productsOnDisk.forEach(x => { tempObj[x.id] = x })
    // fetch products from shopify from the last updated date
    const from = `${new Date(storeInfo.products.updated).toISOString().substring(0,11)}00:00:00-00:00`
    const products = await shopify.getProducts({
      updated_at_min: from
    })
    if (products.length) {
      log({level:'info',message:`${products.length} products updated since ${from}`})
      let newProducts = 0
      let updatedProducts = 0
      for (let i = 0; i < products.length; i++) {
        if (!tempObj[products.id]) newProducts += 1
        else updatedProducts += 1
        tempObj[products.id] = products[i]
      }
      // clear the existing products from disk arr, rehydrate it, save it
      productsOnDisk.length = 0
      for (let prop in tempObj) productsOnDisk.push(tempObj[prop])
      await fs.writeJson('./data/products.json', productsOnDisk)
      log({level:'info',message:`created ${newProducts}, updated ${updatedProducts} products`})
    } else {
      log({level:'info',message:`no products updated since ${from}`})
    }
  }

  updateHomepageNotes()
  draw()
}

// this really doesnt belong here
async function syncInventoryItems(productIds) {
  const batchSize = 100
  // if productIds doesnt exist, pull from disk. always replace all inventory items
  // for some reason unknown to me atm
  if (!productIds) {
    let products = await fs.readJson('./data/products.json')
    productIds = products.map(x => x.id)
  }
  let inventoryItems = []
  for (let i = 0; i < productIds.length; i+= batchSize) {
    const idBatch = productIds.slice(i, i+batchSize)
    const res = await shopify.getInventoryItems(idBatch)
    // not sure wtf a failure looks like for this, bad
    inventoryItems = inventoryItems.concat(res.body.inventory_items)
    await util.delay(1000)
  }
  await fs.writeJson('./data/inventoryItems.json', inventoryItems)
}

async function syncOrders() {
  log({level:'info',message:`syncing orders`})
}

// arr param should be an array of string(the chalkier the better)
function addNotes(name, arr) {
  // add notes to display on <name> page
  // need a way to handle duplicates and what not. for now, replace everytime
  notes[name] = arr
}

function updateHomepageNotes() {
  const messages = []
  if (storeInfo.products.updated) {
    messages.push(`${chalk.bold(storeInfo.products.count)} products, last synced ${chalk.underline(storeInfo.products.updated)}`)
  } else {
    messages.push(chalk.dim(`No product data`))
  }
  if (storeInfo.orders.updated) {
    messages.push(`${chalk.bold(storeInfo.orders.count)} orders, last synced ${chalk.underline(storeInfo.orders.updated)}`)
  } else {
    messages.push(chalk.dim(`No order data`))
  }
  if (messages.length) addNotes('home', messages)
}

function goBack() {
  if (stack.length > 1) stack.pop()
  currentRow = 0
  draw()
}

async function viewLogs() {
  log({level:'error',message:'this friggen method does not work, cant get it to work to save my life'})
  let text = ''
  for (let i = 0; i < logStream.length; i++) text += `${logStream[i]}\n`
  text += chalk.underline.bold('hit backspace to exit')
  print(text)
}

async function generateProductReport() {
  let products = await fs.readJson('./data/products.json')
  const summary = reports.generateProductSummary(products)
  const report = reports.generateProductAudioReport(summary)
  products = null
  util.shaberu(report, 'en-US')
  goBack()
}

async function updateSettings() {
  log({level:'warn',message:'Doesnt do anything at the moment'})
}
