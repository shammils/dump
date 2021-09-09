const fs = require('fs-extra')
const path = require('path')
const request = require('./lib/request.js')
const Shopify = require('./lib/shopify.js')
const shopify = new Shopify()
const util = require('./lib/util.js')

const storeName = process.env.SHOPIFYSTORENAME
const apiKey = process.env.SHOPIFYAPIKEY
const password = process.env.SHOPIFYPASSWORD

dryRunProducts()
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
      weight: 0.3,
      weight_unit: 'lb',
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

//getProducts()
async function getProducts() {
  const res = JSON.parse(
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
  for (let i = 0; i < res.products.length; i++) {
    if (res.products[i].id === 7053586038939) {
      console.log(JSON.stringify(res.products[i], ' ', 2))
      process.exit(0)
    }
  }

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
  console.log('res', res);
}

//cleanString()
function cleanString() {
  const winGex =  /[<>:"\/\\|?*]+/g
  console.log("|?*Product: Name/newline<>after".replace(winGex, ''))
}
