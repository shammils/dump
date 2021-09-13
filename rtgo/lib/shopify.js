const url = require('url')
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

    // overwite the title from base. TODO: overwrite everything with base basically...
    if (data.base && data.base.title) {
      log('debug', `title changed from ${imdb.title} to ${data.base.title}`)
      imdb.title = data.base.title
    }
    const product = {
      title: imdb.title,
      body_html: `<p>${imdb.description}</p>\n<ul>\n`,
      vendor: this.storeName,
      product_type: imdb.type,
      status,
      tags: imdb.genres.join(', '),
      options: [{
        name: 'Title',
        values: ['Default Title'],
      }],
      variants: [{
        title: 'Default Title',
        price: '3.99',
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
    const response = JSON.parse(
      Buffer.from(await request('https', {
        method: 'POST',
        host: `${this.storeName}.myshopify.com`,
        path: `/admin/api/2020-10/products.json`,
        headers: {
          'Content-Type': 'application/json'
        },
        auth: `${this.apiKey}:${this.password}`
      }, JSON.stringify({product}))))
    return response.body
  }

  async getProductCount() {
    const response = JSON.parse(
      Buffer.from(await request('https', {
        method: 'GET',
        host: `${this.storeName}.myshopify.com`,
        path: `/admin/api/2020-10/products/count.json`,
        headers: {
          'Content-Type': 'application/json'
        },
        auth: `${this.apiKey}:${this.password}`
      })))
    return response.body
  }

  async getProducts(params = null, uri = null, products = null) {
    let options
    if (!uri) {
      options = {
        method: 'GET',
        host: `${this.storeName}.myshopify.com`,
        path: `/admin/api/2020-10/products.json`,
        headers: {
          'Content-Type': 'application/json'
        },
        auth: `${this.apiKey}:${this.password}`
      }
      // feels shitty to build a query string like this
      if (params) {
        let queryParts = []
        if (params.limit) queryParts.push(`limit=${params.limit}`)
        if (params.ids) queryParts.push(`ids=${params.ids.join(',')}`)
        if (queryParts.length) options.path += `?${queryParts.join('&')}`
      }
    } else {
      const uriObj = new URL(uri)
      options = {
        method: 'GET',
        host: uriObj.host,
        path: `${uriObj.pathname}${uriObj.search}`,
        headers: {
          'Content-Type': 'application/json'
        },
        auth: `${this.apiKey}:${this.password}`
      }
    }
    //console.log('options', options)
    const response = JSON.parse(
      Buffer.from(await request('https', options))
    )
    //console.log(JSON.stringify(response))
    if (products) products = products.concat(response.body.products)
    else products = response.body.products
    // it would be smarter to use regex to pluck next in case order changes
    if (response.headers.link && response.headers.link.endsWith('rel="next"')) {
      // get next page of results
      const link = util.parseLink(response.headers.link)
      //console.log(`will now hit this thingy`, link)
      return this.getProducts(null, link, products)
    }
    return products
    //process.exit(0)
  }

  async updateProduct(id, putRequestObj) {
    const response = JSON.parse(
      Buffer.from(await request('https', {
        method: 'PUT',
        host: `${this.storeName}.myshopify.com`,
        path: `/admin/api/2021-07/products/${id}.json`,
        headers: {
          'Content-Type': 'application/json'
        },
        auth: `${this.apiKey}:${this.password}`
      }, JSON.stringify(putRequestObj))))
    return response.body
  }

  async getInventoryItems(ids) {
    const response = JSON.parse(
      Buffer.from(await request('https', {
        method: 'GET',
        host: `${this.storeName}.myshopify.com`,
        path: `/admin/api/2021-07/inventory_items.json?ids=${ids.join(',')}`,
        headers: {
          'Content-Type': 'application/json'
        },
        auth: `${this.apiKey}:${this.password}`
      })))
    return response.body
  }

  async updateInventoryItem(id, putRequestObj) {
    const response = JSON.parse(
      Buffer.from(await request('https', {
        method: 'PUT',
        host: `${this.storeName}.myshopify.com`,
        path: `/admin/api/2021-07/inventory_items/${id}.json`,
        headers: {
          'Content-Type': 'application/json'
        },
        auth: `${this.apiKey}:${this.password}`
      }, JSON.stringify(putRequestObj))))
    return response.body
  }
}

nodeUtil.inherits(Shopify, EventEmitter)
module.exports = Shopify
