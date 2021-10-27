const fs = require('fs-extra')
const path = require('path')
const request = require('./lib/request.js')
const Shopify = require('./lib/shopify.js')
const shopify = new Shopify()
const util = require('./lib/util.js')
const chalk = require('chalk')
const Reports = require('./lib/reports.js')
const reports = new Reports()
const Gooten = require('./lib/gooten.js')
const gooten = new Gooten()
const url = require('url')

const storeName = process.env.SHOPIFYSTORENAME
const apiKey = process.env.SHOPIFYAPIKEY
const password = process.env.SHOPIFYPASSWORD

shopify.on('log', log)

function log(log) {
  switch (log.level) {
    case 'debug': {
      console.log(chalk.blue(`${new Date().toISOString()}: ${log.message}`))
    } break
    case 'info': { console.log(`${new Date().toISOString()}: ${log.message}`) } break
    case 'warn': { console.log(chalk.yellow(`${new Date().toISOString()}: ${log.message}`)) } break
    case 'error': { console.log(chalk.red(`${new Date().toISOString()}: ${log.message}`)) } break
    default:
      throw `unsupported log level ${log.level}`
  }
}

temp()
async function temp() {
  //console.log(await gooten.listPRPProducts())
  console.log(await gooten.listPRPProductVariants({productName:'Throw Pillows test'}))
  process.exit()
}

//testReporting()
async function testReporting() {
  const products = await fs.readJson('./data/products.json')
  const summary = await reports.generateProductSummary(products)
  console.log(summary)
  console.log(reports.audioProductBase(summary))
  console.log(reports.audioProductPrice(summary))
  console.log(reports.audioProductTagsSimple(summary))
  console.log(reports.audioProductTagsDetailed(summary))
  process.exit(0)
}

//pullBatch()
function pullBatch() {
  // grab the last n results(without throwing)
  const max = 5
  const arr = [1,2,3,4,5,6,7,8,9]
  console.log(arr.slice(arr.length-max, arr.length))
}

//matchBetween()
function matchBetween() {
  const string = "<https://storename.myshopify.com/admin/api/2020-10/products.json?limit=10&page_info=eyJsYXN0X2lkIjo3MDYxMzY0NjA1MDgzLCJsYXN0X3ZhbHVlIjoiR2FyZmllbGQiLCJkaXJlY3Rpb24iOiJuZXh0In0>; rel=\"next\""
  const gex = /(?<=\<)(.*?)(?=\>)/g
  console.log(string.match(gex))

  console.log(string.endsWith('rel="next"'))
}

// TODO: batch update by product ID batches instead of pulling all products
// at once
//updateProducts()
async function updateProducts() {
  // this copy is just going to update everything, IDGAF
  const paths = await util.fetchInfoFileDirs(process.env.PRODUCTSPATH ?? "")
  const toPrice = process.env.TOPRICE
  const status = process.env.STATUS

  if (isNaN(parseFloat(toPrice))) {
    console.log('prices must be floats')
    process.exit(400)
  }
  if (!paths.length) {
    console.log('didnt find shit in path', process.env.PRODUCTSPATH)
    process.exit(400)
  }
  if (status !== 'draft' && status !== 'active') {
    console.log('only draft and active are status options. recieved', process.env.STATUS)
    process.exit(400)
  }

  const localProducts = {}
  for (let i = 0; i < paths.length; i++) {
    const data = await fs.readJson(paths[i])
    if (data.shopify && data.shopify.product) {
      localProducts[data.shopify.product.id] = {
        data,
        updatedProduct: shopify.generateProductObject({
          data,
          status,
          price: toPrice,
        }),
        path: paths[i]
      }
    }
  }

  const localProductIds = Object.keys(localProducts).map(p => parseInt(p))
  console.log('product ids', localProductIds)

  // get products by ids
  const products = await shopify.getProducts({ids:localProductIds})
  console.log('products from shopify count', products.length)

  if (!products.length) {
    console.log(`no products returned from shopify for some reason`)
    process.exit(0)
  }

  for (let i = 0; i < products.length; i++) {
    if (products[i].variants.length === 1) {
      let localProduct = localProducts[products[i].id]
      const updateProductResult = await shopify.updateProduct(products[i].id, {
        product: {
          id: products[i].id,
          body_html: localProduct.updatedProduct.body_html,
          status,
          variants: [{
            id: products[i].variants[0].id,
            price: toPrice,
          }]
        }
      })
      console.log(`${i+1}/${products.length} update product '${products[i].title}' result`, updateProductResult)
      if (!updateProductResult.product) {
        console.log(`failed to update '${products[i].title}'`, updateProductResult)
        process.exit(500)
      }

      // update inventory item
      await util.delay(500)
      const updateItemResult = await shopify.updateInventoryItem(products[i].variants[0].inventory_item_id, {
        inventory_item: {
          id: products[i].variants[0].inventory_item_id,
          cost: toPrice,
        }
      })
      if (!updateItemResult.inventory_item) {
        console.log(`${i+1}/${products.length} failed to update inventory item '${products[i].title}', inv id '${products[i].variants[0].inventory_item_id}' product id '${products[i].id}'`)
        process.exit(500)
      }
      console.log(`${i+1}/${products.length} update inventory item result`, updateItemResult)
      // update file on disk
      localProduct.data.shopify.product = updateProductResult.product
      // currently not saving inventory item for some reason. just dont really
      // care 'is all
      await fs.writeJson(localProduct.path, localProduct.data, {spaces:2})
      console.log(`${i+1}/${products.length} updated json file for '${products[i].title}' at '${localProduct.path}'`)
      await util.delay(1000)
    } else {
      console.log(`product ${products[i].id} has no variant`)
    }
  }
  console.log('complete')
  process.exit(0)
}

//updatePrices()
async function updatePrices() {
  // for some reason will only update prices of objects that are saved locally.
  // if you want non local files updated, first pull them down(even though that
  // functionality does not exist yet)
  const paths = await util.fetchInfoFileDirs(process.env.PRODUCTSPATH ?? "")
  const fromPrice = process.env.FROMPRICE
  const toPrice = process.env.TOPRICE
  if (isNaN(parseFloat(fromPrice)) || isNaN(parseFloat(toPrice))) {
    console.log('prices must be floats')
    process.exit(0)
  }
  const localProducts = []
  for (let i = 0; i < paths.length; i++) {
    const data = await fs.readJson(paths[i])
    if (data.shopify && data.shopify.product) {
      localProducts.push(data)
    }
  }
  if (!localProducts.length) {
    console.log('failed to find any products')
    process.exit(0)
  }
  const localProductIds = localProducts.map(p => p.shopify.product.id)
  console.log(localProductIds)
  // get products by ids
  const products = await shopify.getProducts({ids:localProductIds})
  console.log('pl', products.length)
  if (!products.length) {
    console.log(`no products found in dir ${process.env.PRODUCTSPATH}`)
    process.exit(0)
  }
  // we need to update the base variants and inventory products
  for (let i = 0; i < products.length; i++) {
    if (products[i].variants.length === 1) {
      if (products[i].variants[0].price === fromPrice) {
        const updateProductResult = await shopify.updateProduct(products[i].id, {
          product: {
            id: products[i].id,
            variants: [{
              id: products[i].variants[0].id,
              price: toPrice,
            }]
          }
        })
        console.log('updateProductResult', updateProductResult)

        // update inventory item
        const updateItemResult = await shopify.updateInventoryItem(products[i].variants[0].inventory_item_id, {
          inventory_item: {
            id: products[i].variants[0].inventory_item_id,
            cost: toPrice,
          }
        })
        console.log('updateItemResult', updateItemResult)

        // update local file?
        console.log(`${i+1}/${products.length} processed`)
      } else {
        console.log(`${i+1}/${products.length} product '${products[i].title}' has a price of ${products[i].variants[0].price}, not updating`)
        continue
      }
    } else {
      console.log(`${i+1}/${products.length} product '${products[i].title}' has more than 1 variant, ignoring for now`)
      continue
    }
  }
  console.log('complete')
  process.exit(0)
}

//pagingTest()
async function pagingTest() {
  const products = await shopify.getProducts({
    limit: 10
  })
  console.log(products)
  process.exit(0)
}

//skuwerString()
function skuwerString() {
  const paragraph = 'sdfsdfs';
  const regex = /[A-Za-z\d]/g;
  const found = paragraph.match(regex)
  if (found && found.length) {
    console.log(found.join('').toUpperCase())
  }
  console.log(found);
}

//dryRunProducts()
async function dryRunProducts() {
  const paths = await util.fetchInfoFileDirs('/home/shigoto/products/ACTIVE')
  if (paths.length) {
    for (let i = 0; i < paths.length; i++) {
      const data = await fs.readJson(paths[i])

      // get image
      const pathObj = path.parse(paths[i])
      //console.log(pathObj)
      // TODO: pluck this from imdb.coverImage when it points to the proper version
      // by default
      const imagePath = path.join(pathObj.dir, 'metadata', `cover_full_${data.sources.imdb.version}.jpg`)
      if (fs.existsSync(imagePath)) {
        console.log('!!! found full imdb image !!!')
      } else {
        console.log('MISSING FULL IMDB IMAGE')
      }
      const product = shopify.generateProductObject({
        data,
        status: 'draft',
        base64Image: null,
        price: '9.99',
      })
      console.log(`${i+1}/${paths.length}`, product)
      const answer = await util.askQuestion(`suzuki?`)
    }
    console.log('end')
    process.exit(0)
  } else {
    console.log('no jsons found')
  }
}

//tabThroughOptions()
async function tabThroughOptions() {
  for (let i = 0; i < 10; i++) {
    const answer = await util.askQuestion(`${i+1}/10, suzuki?`)
    console.log(answer)
  }
  process.exit(0)
}

//getPaths()
async function getPaths() {
  const paths = await util.fetchInfoFileDirs()
  console.log(paths)
}

function getSku(obj) {
  let sku = ''
  obj.title.split(' ').forEach(w => {
    if (w.length) sku += w[0]
  })
  if (obj.type === "Movie") sku += '-MV'
  else if (obj.type === 'TV Series') sku += `-TV`
  else throw `unknown type ${obj.type}`
  sku += `-${obj.releaseYear}`//.substring(2)
  sku += '-USD-DVD'
  return sku
}

//createProduct()
async function createProduct() {
  // read some json file
  const jsonPath = process.env.JSONPATH
  const data = await fs.readJson(jsonPath)
  const imdb = data.data[`imdb_${data.sources.imdb.version}`]
  let wiki
  if (data.sources.wikipedia && typeof data.sources.wikipedia.version === 'number') {
    wiki = data.data[`wikipedia_${data.sources.wikipedia.version}`]
  }
  const product = {
    title: imdb.title,
    body_html: `<p>${imdb.description}</p><ul>`,
    vendor: storeName,
    product_type: 'DVD',
    status: 'draft',
    tags: imdb.genres.join(', '),
    options: [{
      name: 'Title',
      values: ['Default Title'],
    }],
    variants: [{
      title: 'Default Title',
      price: '0.99',
      sku: getSku(imdb),
      inventory_policy: 'deny',
      compare_at_price: null,
      fulfillment_service: 'manual',
      inventory_management: 'shopify',
      option1: 'Default Title',
      option2: null,
      option3: null,
      taxable: true,
      barcode: '',
      grams: 136,
      weight: 3.0,
      weight_unit: 'oz',
      inventory_quantity: 0,
      old_inventory_quantity: 0,
      requires_shipping: true,
    }]
  }
  if (imdb.director) {
    product.body_html += `<li>Director: ${imdb.director}</li>`
  }
  if (imdb.creator) {
    product.body_html += `<li>Creator: ${imdb.creator}</li>`
  }
  product.body_html += `<li>Rating: ${imdb.parentalRating}</li>`
  product.body_html += `<li>Genres: ${imdb.genres.join(', ')}</li>`
  product.body_html += `<li>Stars: ${imdb.stars.join(', ')}</li>`
  product.body_html += `<li>Runtime: ${imdb.runtime}</li>`
  product.body_html += `<li>Release Year: ${imdb.releaseYear}</li>`
  product.body_html += '</ul>'

  // get image
  const pathObj = path.parse(jsonPath)
  //console.log(pathObj)
  // TODO: pluck this from imdb.coverImage when it points to the proper version
  // by default
  const imagePath = path.join(pathObj.dir, 'metadata', `cover_full_${data.sources.imdb.version}.jpg`)
  if (fs.existsSync(imagePath)) {
    const buf = fs.readFileSync(imagePath)
    product.images = [{attachment: buf.toString('base64')}]
  }

  //console.log(product)
  //process.exit(0)
  const res = JSON.parse(Buffer.from(await request('https', {
    method: 'POST',
    host: `${storeName}.myshopify.com`,
    path: `/admin/api/2020-10/products.json`,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: `${apiKey}:${password}`
  }, JSON.stringify({product}))));
  console.log('res', res);

  if (res.error || res.errors) {
    //console.error(res)
  } else {
    // create a shopify object in the json
    data.shopify = { res }
    // write to disk
    await fs.writeJson(jsonPath, data, {spaces:2})
    console.log('DEKITA!')
  }
}

//getProductsFromURI()
async function getProductsFromURI() {
  const uriObj = new URL('https://themoviestore53.myshopify.com/admin/api/2020-10/products.json?limit=50&page_info=eyJkaXJlY3Rpb24iOiJuZXh0IiwibGFzdF9pZCI6NzEyODU2MjE3MjA1OSwibGFzdF92YWx1ZSI6IlRoZSBEYXkgQWZ0ZXIgVG9tb3Jyb3cifQ')
  options = {
    method: 'GET',
    host: uriObj.host,
    path: `${uriObj.pathname}${uriObj.search}`,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: `${apiKey}:${password}`
  }
  const response = JSON.parse(
    Buffer.from(await request('https', options))
  )
  console.log(response)
  process.exit(0)
}

//getProducts()
async function getProducts() {
  /*const res = JSON.parse(
    Buffer.from(await request('https', {
      method: 'GET',
      host: `${storeName}.myshopify.com`,
      path: `/admin/api/2020-10/products.json`,
      headers: {
        'Content-Type': 'application/json'
      },
      auth: `${apiKey}:${password}`
    })));
  console.log('res', res);
  process.exit(0)
*/
  const res = await shopify.getProducts()
  console.log('res', res)
}

//getInventoryItems()
async function getInventoryItems() {
  const res = JSON.parse(
    Buffer.from(await request('https', {
      method: 'GET',
      host: `${storeName}.myshopify.com`,
      path: `/admin/api/2021-07/inventory_items.json?ids=43185025646747`,
      headers: {
        'Content-Type': 'application/json'
      },
      auth: `${apiKey}:${password}`
    })));
  console.log('res', JSON.stringify(res, ' ', 2));
  //for (let i = 0; i < res.items.length; i++) {
    //if (res.products[i].id === 7053586038939) {
      //console.log(JSON.stringify(res.products[i], ' ', 2))
      //process.exit(0)
    //}
  //}
}

//getProductCount()
async function getProductCount() {
  const res = JSON.parse(
    Buffer.from(await request('https', {
      method: 'GET',
      host: `${process.env.SHOPIFYSTORENAME}.myshopify.com`,
      path: `/admin/api/2020-10/products/count.json`,
      headers: {
        'Content-Type': 'application/json'
      },
      auth: `${process.env.SHOPIFYAPIKEY}:${process.env.SHOPIFYPASSWORD}`
    })));
  console.log('res', JSON.stringify(res, ' ', 2));
  //console.log('res', JSON.stringify(await shopify.getProductCount(), ' ', 2));
}

//cleanString()
function cleanString() {
  const winGex =  /[<>:"\/\\|?*]+/g
  console.log("|?*Product: Name/newline<>after".replace(winGex, ''))
}
