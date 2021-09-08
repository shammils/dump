const request = require('./lib/request.js')
const fs = require('fs-extra')

//createProduct()
async function createProduct() {
  // read some json file
  const data = await fs.readJson(jsonPath)
  
  product.body_html += '</ul>'
  process.exit(0)
  const res = JSON.parse(
    Buffer.from(await request('https', {
      method: 'POST',
      host: `${storeName}.myshopify.com`,
      path: `/admin/api/2020-10/products.json`,
      headers: {
        'Content-Type': 'application/json'
      },
      auth: `${apiKey}:${password}`
    }, product)));
  console.log('res', res);
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
  console.log(JSON.stringify(res.products[0], ' ', 2))
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
