const fs = require('fs-extra')
const path = require('path')
const request = require('./lib/request.js')
const Shopify = require('./lib/shopify.js')
const shopify = new Shopify()
const util = require('./lib/util.js')

const storeName = process.env.SHOPIFYSTORENAME
const apiKey = process.env.SHOPIFYAPIKEY
const password = process.env.SHOPIFYPASSWORD


//matchBetween()
function matchBetween() {
  const string = "<https://storename.myshopify.com/admin/api/2020-10/products.json?limit=10&page_info=eyJsYXN0X2lkIjo3MDYxMzY0NjA1MDgzLCJsYXN0X3ZhbHVlIjoiR2FyZmllbGQiLCJkaXJlY3Rpb24iOiJuZXh0In0>; rel=\"next\""
  const gex = /(?<=\<)(.*?)(?=\>)/g
  console.log(string.match(gex))

  console.log(string.endsWith('rel="next"'))
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
    products.exit(0)
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
  const paths = await util.fetchInfoFileDirs('/home/watashino/Videos/products')
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
      const product = shopify.generateProductObject(data,'draft')
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

getProducts()
async function getProducts() {
  /*const res = JSON.parse(
    Buffer.from(await request('https', {
      method: 'GET',
      host: `${storeName}.myshopify.com`,
      path: `/admin/api/2020-10/products.json?ids=7062631383195`,
      headers: {
        'Content-Type': 'application/json'
      },
      auth: `${apiKey}:${password}`
    })));
  console.log('res', res);
  for (let i = 0; i < res.products.length; i++) {
    //if (res.products[i].id === 7053586038939) {
      console.log(JSON.stringify(res.products[i], ' ', 2))
      //process.exit(0)
    //}
  }*/
  const res = await shopify.getProducts({ids:[7062631383195]})
  console.log('res', JSON.stringify(res, ' ', 2))
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
      host: `${storeName}.myshopify.com`,
      path: `/admin/api/2020-10/products/count.json`,
      headers: {
        'Content-Type': 'application/json'
      },
      auth: `${apiKey}:${password}`
    })));
  console.log('res', JSON.stringify(res, ' ', 2));
  //console.log('res', JSON.stringify(await shopify.getProductCount(), ' ', 2));
}

//cleanString()
function cleanString() {
  const winGex =  /[<>:"\/\\|?*]+/g
  console.log("|?*Product: Name/newline<>after".replace(winGex, ''))
}
