const url = require('url')
const nodeUtil = require('util')
const EventEmitter = require('events').EventEmitter
/*
https://www.gooten.com/api-documentation/print-ready-products/
*/
const request = require('./request.js')
const util = require('./util.js')
let _self

function log(level, message) { _self.emit("log",{module:'gooten',level,message})}

class Gooten {
  constructor() {
    _self = this
    EventEmitter.call(this)
    this.recipeId = process.env.GOOTENRECIPEID
    this.partnerBillingKey = process.env.GOOTENPARTNERBILLINGKEY
  }

  getSku(obj) {
    let sku = util.skuwerString(obj.title)
    if (obj.type === "Movie") sku += '-MV'
    else if (obj.type === 'TV Series') {
      sku += `-TV-S${obj.season}`
    } else throw `unknown type ${obj.type}`
    sku += `-${obj.releaseYear}`//.substring(2)
    // might support PAL one day, and we should be supporting blueray sooner than
    // later. USD means used
    sku += '-NTSC-USD-DVD'
    return sku
  }

  async listPRPProducts(params = null, products = null) {
    if (!params) params = {page:1}
    const response = JSON.parse(
      Buffer.from(await request('https', {
        method: 'GET',
        host: `api.print.io`,
        path: `/api/v/5/source/api/prpproducts/?recipeid=${this.recipeId}&page=${params.page}`,
        headers: {
          'Content-Type': 'application/json'
        },
      })))
    if (response.body.HadError) {
      log('error', `error listing PRP products: ${JSON.stringify(response)}`)
      return response.body
    }
    if (products) products = products.concat(response.body.Products)
    else products = response.body.Products

    log('debug', `on page ${response.body.Page}, total pages: ${response.body.PageCount}, product count: ${response.body.Products.length}`)
    if (response.body.PageCount === response.body.Page ||
    !response.body.Products.length) {
      return products
    } else {
      await util.delay(1000)
      return this.listPRPProducts({page: response.body.Page += 1}, products)
    }
  }

  /*
    If we supply no productName variable, this call returns all variants for all
    products. At the moment this isnt needed so lets require productName
  */
  async listPRPProductVariants(params, variants = null) {
    if (!params.page) params.page = 1
    const response = JSON.parse(
      Buffer.from(await request('https', {
        method: 'GET',
        host: `api.print.io`,
        path: `/api/v/5/source/api/prpvariants/?recipeid=${this.recipeId}&page=${params.page}&productName=${url.format(params.productName)}`,
        headers: {
          'Content-Type': 'application/json'
        },
      })))
    if (response.body.HadError) {
      log('error', `error listing PRP product variants: ${JSON.stringify(response)}`)
      return response.body
    }
    if (variants) variants = variants.concat(response.body.Variants)
    else variants = response.body.Variants

    log('debug', `on page ${response.body.Page}, total pages: ${response.body.PageCount}, variant count: ${response.body.Variants.length}`)
    if (response.body.PageCount === response.body.Page ||
    !response.body.Variants.length) {
      return variants
    } else {
      await util.delay(1000)
      params.page += 1
      return this.listPRPProductVariants(params, variants)
    }
  }
}

nodeUtil.inherits(Gooten, EventEmitter)
module.exports = Gooten
