const nodeUtil = require('util')
const EventEmitter = require('events').EventEmitter

const request = require('./request.js')
const util = require('./util.js')
let _self

function log(level, message) { _self.emit("log",{module:'shopify',level,message})}

class Shopify {
  constructor() {
    _self = this
    EventEmitter.call(this)
    // TODO: verify if creds set
    this.storeName = process.env.SHOPIFYSTORENAME
    this.apiKey = process.env.SHOPIFYAPIKEY
    this.password = process.env.SHOPIFYPASSWORD
  }

  getSku(obj) {
    let sku = util.skuwerString(obj.title)
    if (obj.type === "Movie") sku += '-MV'
    else if (obj.type === 'TV Series') sku += `-TV`
    else throw `unknown type ${obj.type}`
    sku += `-${obj.releaseYear}`//.substring(2)
    sku += '-USD-DVD'
    return sku
  }

  generateProductObject(data, status, base64Image=null) {
    if (status !== 'draft' && status !== 'active') throw `incorrect status ${status}`

    const imdb = data.data[`imdb_${data.sources.imdb.version}`]
    let wiki
    if (data.sources.wikipedia && typeof data.sources.wikipedia.version === 'number') {
      wiki = data.data[`wikipedia_${data.sources.wikipedia.version}`]
    }
    const product = {
      title: imdb.title,
      body_html: `<p>${imdb.description}</p>\n<ul>\n`,
      vendor: this.storeName,
      product_type: 'DVD',
      status,
      tags: imdb.genres.join(', '),
      options: [{
        name: 'Title',
        values: ['Default Title'],
      }],
      variants: [{
        title: 'Default Title',
        price: '0.99',
        sku: this.getSku(imdb),
        inventory_policy: 'deny',
        compare_at_price: null,
        fulfillment_service: 'manual',
        inventory_management: 'shopify',
        option1: 'Default Title',
        option2: null,
        option3: null,
        taxable: true,
        barcode: '',
        //grams: 136,
        weight: 3.0,
        weight_unit: 'oz',
        inventory_quantity: 0,
        requires_shipping: true,
      }]
    }
    if (imdb.director) {
      product.body_html += `  <li>Director: ${imdb.director}</li>\n`
    }
    // looks weird when director and creator are the same
    if (imdb.creator && imdb.director !== imdb.creator) {
      product.body_html += `  <li>Creator: ${imdb.creator}</li>\n`
    }
    if (!imdb.creator && imdb.director && wiki) {
      // try to pull something from wiki?
      if (wiki['Directed by']) {
        product.body_html += `  <li>Director: ${wiki['Directed by']}</li>\n`
      }
      if (wiki['Written by']) {
        product.body_html += `  <li>Writer: ${wiki['Written by']}</li>\n`
      }
      if (wiki['Editor']) {
        product.body_html += `  <li>Editor: ${wiki['Editor']}</li>\n`
      }
    }
    if (wiki) {
      if (wiki['Producer']) {
        product.body_html += `  <li>Producer: ${wiki['Producer']}</li>\n`
      } else if (wiki['Producers']) {
        if (Array.isArray(wiki['Producers']) && wiki['Producers'].length) {
          product.body_html += `  <li>Producers: ${wiki['Producers'].join(', ')}</li>\n`
        }
      }
      if (wiki['Executive producer']) {
        product.body_html += `  <li>Executive Producer: ${wiki['Executive producer']}</li>\n`
      }
    }
    product.body_html += `  <li>Rating: ${imdb.parentalRating}</li>\n`
    product.body_html += `  <li>Genres: ${imdb.genres.join(', ')}</li>\n`
    product.body_html += `  <li>Stars: ${imdb.stars.join(', ')}</li>\n`
    if (imdb.runtime) {
      product.body_html += `  <li>Runtime: ${imdb.runtime}</li>\n`
    } else {
      if (wiki && wiki['Running time']) {
        product.body_html += `  <li>Runtime: ${wiki['Running time']}</li>\n`
      }
    }
    product.body_html += `  <li>Release Year: ${imdb.releaseYear}</li>\n`
    product.body_html += '</ul>'

    if (base64Image) {
      product.images = [{attachment: base64Image}]
    }

    return product
  }

  async publishProduct(product) {
    return JSON.parse(
      Buffer.from(await request('https', {
        method: 'POST',
        host: `${this.storeName}.myshopify.com`,
        path: `/admin/api/2020-10/products.json`,
        headers: {
          'Content-Type': 'application/json'
        },
        auth: `${this.apiKey}:${this.password}`
      }, JSON.stringify({product}))))
  }

  async getProductCount() {
    return JSON.parse(
      Buffer.from(await request('https', {
        method: 'GET',
        host: `${this.storeName}.myshopify.com`,
        path: `/admin/api/2020-10/products/count.json`,
        headers: {
          'Content-Type': 'application/json'
        },
        auth: `${this.apiKey}:${this.password}`
      })))
  }

  async getProducts() {
    return JSON.parse(
      Buffer.from(await request('https', {
        method: 'GET',
        host: `${this.storeName}.myshopify.com`,
        path: `/admin/api/2020-10/products.json`,
        headers: {
          'Content-Type': 'application/json'
        },
        auth: `${this.apiKey}:${this.password}`
      })))
  }

  async getInventoryItems(ids) {
    return JSON.parse(
      Buffer.from(await request('https', {
        method: 'GET',
        host: `${this.storeName}.myshopify.com`,
        path: `/admin/api/2021-07/inventory_items.json?ids=${ids.join(',')}`,
        headers: {
          'Content-Type': 'application/json'
        },
        auth: `${this.apiKey}:${this.password}`
      })))
  }

  async updateInventoryItem(id, putRequestObj) {
    return JSON.parse(
      Buffer.from(await request('https', {
        method: 'PUT',
        host: `${this.storeName}.myshopify.com`,
        path: `/admin/api/2021-07/inventory_items/${id}.json`,
        headers: {
          'Content-Type': 'application/json'
        },
        auth: `${this.apiKey}:${this.password}`
      }, JSON.stringify(putRequestObj))))
  }
}

nodeUtil.inherits(Shopify, EventEmitter)
module.exports = Shopify
