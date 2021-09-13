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
  const paths = await util.fetchInfoFileDirs(process.env.PRODUCTSPATH)
  if (paths.length) {
    for (let i = 0; i < paths.length; i++) {
      const data = await fs.readJson(paths[i])

      // get image
      const pathObj = path.parse(paths[i])
      //console.log(pathObj)
      // TODO: pluck this from imdb.coverImage when it points to the proper version
      // by default
      const imagePath = path.join(pathObj.dir, 'metadata', `cover_full_${data.sources.imdb.version}.jpg`)
      let base64Image
      if (fs.existsSync(imagePath)) {
        const buf = fs.readFileSync(imagePath)
        base64Image = buf.toString('base64')
      } else {
        console.log(`\n\n '${paths[i]}' MISSING FULL IMDB IMAGE \n\n`)
        continue
      }
      const product = shopify.generateProductObject(data,'active',base64Image)
      if (data.shopify) {
        console.log(`skipping '${product.title}' since it already exists in shopify`)
        continue
      }

      // make clone without product image since it takes so much space
      const productClone = JSON.parse(JSON.stringify(product))
      productClone.images = [{attachment: 'base64String'}]
      console.log(`${i+1}/${paths.length}`, productClone)
      const answer = await util.askQuestion(`suzuki?`)
      // create shopify product
      const createProductResult = await shopify.publishProduct(product)
      console.log('createProductResult', createProductResult)
      if (createProductResult.error || createProductResult.errors) {
        console.log('error creating product', createProductResult)
        continue
      }
      // set inventory item to proper country code
      const updateItemResult = await shopify.updateInventoryItem(createProductResult.product.variants[0].inventory_item_id, {
        inventory_item: {
          id: createProductResult.product.variants[0].inventory_item_id,
          country_code_of_origin: "US"
        }
      })
      console.log('updateItemResult', updateItemResult)
      if (updateItemResult.error || updateItemResult.errors) {
        console.log('error updating inventory item', updateItemResult)
        // we can update the info.json at this point
        //continue
      }
      // save product and inventory item to disk
      data.shopify = { product: createProductResult.product }
      await fs.writeJson(paths[i], data, {spaces:2})

    }
    console.log('end')
    process.exit(0)
  } else {
    console.log('no jsons found')
  }
})()
