class Util {
  constructor() {}
  getAddress() {
    const chars = 'ABCDEFabcdef0123456789'
    let res = ''
    for (let i = 0; i < 40; i++) res += chars.charAt(Math.floor(Math.random() * chars.length))
    return `0x${res}`
  }
  random(max) { return Math.floor(Math.random() * max) }
  bool() { return !!Math.floor(Math.random() * 2) }
  delay = ms =>
  new Promise(resolve =>
    setTimeout(() => resolve(), ms))
}
const util = new Util()
/*
  lets create an example of what the game would do over time in one hour increments

  every 24 hours lets mine our staked Ore
*/
const items = {
  'wood sword': {
    basePrice: 10,
  },
  'iron sword': {
    basePrice: 20,
  },
  'steel sword': {
    basePrice: 30,
  }
}
const hour = 60000 * 60
const mineRate = hour * 24
const data = {
  startingOre: 100,
  mithrilStaked: 1000,
  date: new Date(new Date().toISOString().substring(0,10)),
  lastMine: new Date(new Date().toISOString().substring(0,10)),
  merchant0: {
    logPath: '',
    ore: 0,
    inventory: [],
  },
  merchant1: {
    logPath: '',
    ore: 0,
    inventory: [],
  }
}
let logs = []

;(async () => {
  setup()
  //console.log('data', JSON.stringify(data,null,' '))
  //generateActions()
  //console.log('data', JSON.stringify(data,null,' '))
  startInterval()
})()
function print() {
let text = `
Date: ${data.date.toISOString()}
Total Ore: ${data.merchant0.ore+data.merchant1.ore}
Merchant 1:      Merchant: 2:
Ore: ${data.merchant0.ore}          Ore: ${data.merchant1.ore}
Items: ${data.merchant0.inventory.length}         Items: ${data.merchant1.inventory.length}
InvEstVal: ${data.merchant0.inventory.reduce((p, c) => p+c.basePrice, 0)}    InvEstVal: ${data.merchant1.inventory.reduce((p, c) => p+c.basePrice, 0)}
Wood: ${data.merchant0.inventory.filter(x => x.name === 'wood sword').length}          Wood: ${data.merchant1.inventory.filter(x => x.name === 'wood sword').length}
Iron: ${data.merchant0.inventory.filter(x => x.name === 'iron sword').length}          Iron: ${data.merchant1.inventory.filter(x => x.name === 'iron sword').length}
Steel: ${data.merchant0.inventory.filter(x => x.name === 'steel sword').length}         Steel: ${data.merchant1.inventory.filter(x => x.name === 'steel sword').length}

Events:
${logs.slice(0, 20).join('\n')}
`
  console.clear()
  console.log(text)
}
function generateActions() {
  // player(s) attempts to buy/sell item at merchant 0/1
  const itemKeys = Object.keys(items)
  const playerCount = util.random(3)
  console.log('players this hour', playerCount)
  if (!playerCount) console.log('no players this hour')
  for (let i = 0; i < playerCount; i++) {
    const key = itemKeys[util.random(itemKeys.length)]
    const item = items[key]

    const buying = util.bool()

    const merchantId = util.random(2)
    const merchant = data[`merchant${merchantId}`]
    if (buying) {
      console.log(`attempting to buy ${key} from merchant ${merchantId}`)
      const askedForItemIndex = merchant.inventory.find(x => x.name === key)
      if (askedForItemIndex !== -1) {
        const playerOreAmount = util.random(item.basePrice*1.5)
        const merchantAskingPrice = item.basePrice + (item.basePrice / 10)
        console.log(`merchant has item, player balance ${playerOreAmount}, merchant asking price ${merchantAskingPrice}`)
        // sell to user no matter what at the moment
        merchant.ore += merchantAskingPrice
        merchant.inventory.splice(askedForItemIndex, 1)
        appendLog(`Merchant ${merchantId} sold ${key} for ${merchantAskingPrice}`)
      }
    } else {
      console.log(`attempting to sell ${key} to merchant ${merchantId}`)
      const merchantAskingPrice = item.basePrice - (item.basePrice / 10)
      // TODO: lower asking price when more of same item exists
      if (merchant.ore > merchantAskingPrice) {
        console.log(`item sold to merchant for ${merchantAskingPrice}`)
        merchant.ore -= merchantAskingPrice
        merchant.inventory.push({...item,name:key})
        appendLog(`Merchant ${merchantId} purchased ${key} from player for ${merchantAskingPrice}`)
      } else {
        console.log(`merchant ${merchantId} ore ${merchant.ore}, cannot buy item ${key} for ${merchantAskingPrice}`)
        appendLog(`Merchant ${merchantId} does not have enough ore(${merchant.ore}) to purchase ${key} for ${merchantAskingPrice}`)
      }
    }
  }
}
async function setup() {
  splitCurrentlyAvailableOreToMerchants()
  splitAvailableItemsToMerchants(createItemPool())
}
function splitAvailableItemsToMerchants(itemPool) {
  itemPool.forEach(item => {
    if (util.bool()) data.merchant0.inventory.push(item)
    else data.merchant1.inventory.push(item)
  })
}
function splitCurrentlyAvailableOreToMerchants() {
  data.merchant0.ore = util.random(data.startingOre)
  data.merchant1.ore = data.startingOre - data.merchant0.ore
}
function createItemPool() {
  const itemPool = []
  let itemPoolValue = 0
  const itemKeys = Object.keys(items)
  while (itemPoolValue < data.startingOre) {
     const key = itemKeys[util.random(itemKeys.length)]
    const item = items[key]
    itemPoolValue += item.basePrice
    itemPool.push({...item,name:key})
  }
  return itemPool
}
async function startInterval() {
  setInterval(() => {
    data.date = new Date((+data.date) + hour)
    generateActions()
    //console.log(data.date, data.startingOre)
    if ((data.date - data.lastMine) - mineRate >= 0) {
      const oreAmount = Math.floor((data.mithrilStaked / 100))
      //console.log('mining ore', oreAmount)
      //data.startingOre += oreAmount
      data.lastMine = data.date
      if (data.merchant0.ore > data.merchant1.ore) {
        data.merchant1.ore += oreAmount
      } else {
        data.merchant0.ore += oreAmount
      }
      appendLog(`Mined ${oreAmount} ore, gave it to merchant ${data.merchant0.ore > data.merchant1.ore ? '1' : '0'}`)
    }
    print()
  }, 1000)
}
function appendLog(log) {
  logs.splice(0, 0, `${new Date().toISOString()}:${log}`)
}
