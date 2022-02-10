const fs = require('fs-extra')
const path = require('path')
const request = require('../lib/request.js')
const Shopify = require('../lib/shopify.js')
const shopify = new Shopify()
const util = require('../lib/util.js')

const storeName = process.env.SHOPIFYSTORENAME
const apiKey = process.env.SHOPIFYAPIKEY
const password = process.env.SHOPIFYPASSWORD

;(async () => {
  // fetch products first
  //const products = await shopify.getProducts()
  //await fs.writeJson('products.json', products)
  //console.log(`${products.length} products fetched and saved`)
  //process.exit(0)
  const processedProducts = await fs.readJson('processedProducts.json')
  console.log('pp', processedProducts)
  const products = await fs.readJson('products.json')
  console.log(products[0])
  for (let i = 0; i < products.length; i++) {
    if (!processedProducts[products[i].id.toString()]) {
      if (products[i].variants.length === 1) {
        console.log(`${i}-${products.length}/${Object.keys(processedProducts).length} processing ${products[i].id}`)
        await processProduct(products[i])
        processedProducts[products[i].id.toString()] = {}
        console.log(`${i}-${products.length}/${Object.keys(processedProducts).length} processed ${products[i].id}`)
        await fs.writeJson('processedProducts.json', processedProducts)
      } else {
        console.log(`${i}-${products.length}/${Object.keys(processedProducts).length} product ${products[i].id} has multiple variants`)
      }
    } else {
      console.log(`${i}-${products.length}/${Object.keys(processedProducts).length} ${products[i].id} already processed`)
    }
    //if (i > 0) process.exit(0)
  }
  process.exit(0)
})()

async function processProduct(product) {
  // this method is extremely fucked and has a lot of issues. god help you if you
  // ever need to run this more than once.

  // get test run product from shopify
  //const product = await shopify.getProducts({ids:['7274751983771']})
  //console.log('product', JSON.stringify(product, ' ', 2))

  // get inventory items
  //const inventoryItems = await shopify.getInventoryItems([product[0].variants[0].inventory_item_id])
  //console.log('inItems', JSON.stringify(inventoryItems, ' ', 2))

  // update existing variant
  //await util.delay(1000)
  const updateVariantResult = await shopify.updateVariant(product.variants[0].id, {
    variant: {
      title: 'USED',
      option1: 'USED',
    }
  })
  console.log('update variant result', JSON.stringify(updateVariantResult, ' ', 2))

  // create new sku from existing sku
  const sku = product.variants[0].sku.replace('USD', 'NEW')
  console.log('new sku', sku)

  // create variant
  await util.delay(1000)
  const createVariantResult = await shopify.createVariant(product.id, {
    title: 'NEW',
    product_id: product.id,
    price: 12.99,
    sku,
    inventory_policy: 'deny',
    compare_at_price: null,
    fulfillment_service: 'manual',
    inventory_management: 'shopify',
    option1: 'NEW',
    option2: null,
    option3: null,
    taxable: true,
    barcode: '',
    //grams: 136,
    weight: 3.0,
    weight_unit: 'oz',
    //inventory_quantity: 0,
    requires_shipping: true,
  })
  console.log('create var res', JSON.stringify(createVariantResult, ' ', 2))

  // update inventory item
  await util.delay(1000)
  const updateItemResult = await shopify.updateInventoryItem(createVariantResult.variant.inventory_item_id, {
    inventory_item: {
      id: createVariantResult.variant.inventory_item_id,
      country_code_of_origin: "US"
    }
  })
  console.log('update inventory item result', JSON.stringify(updateItemResult, ' ', 2))
  return
}
