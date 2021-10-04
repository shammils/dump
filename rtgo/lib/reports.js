const nodeUtil = require('util')
const EventEmitter = require('events').EventEmitter

let _self
function log(level, message) { _self.emit("log",{module:'reports',level,message})}

class Reports {
  constructor() {
		_self = this
		EventEmitter.call(this)
	}
  /*
    - product count (COMPLETE)
    - how many
      - active, draft, etc (COMPLETE)
    - last one updated (COMPLETE)
    - oldest updated (COMPLETE? skeptical)
    - most expensive (COMPLETE)
    - cheapest (COMPLETE)
    - tag allocation
      - how many tags hit (COMPLETE)
      - most and least popular tag(ignore 'Release Year:YYYY')
    ****
    - smallest image
    - largest image

    TODO: write code to generate date text like '1 minute ago', '3 months ago',
          etc.
  */
  generateProductSummary(products) {
    const data = {
      count: 0,
      active: 0,
      draft: 0,
      archived: 0,
      tvShows: 0,
      movies: 0,
      unknownProductType: [],
      missingTags: [],
      tags: {},
      prices: {},
      inStock: 0,
      inStockValue: 0,
      highestPrice: 0,
      lowestPrice: null,
      latestUpdateProduct: {
        date: null,
        id: null,
        title: null,
      },
      oldestUpdatedProduct: {
        date: null,
        id: null,
        title: null,
      },
      missingImages: [],
    }
    if (!products) return data
    data.count = products.length
    for (let i = 0; i < products.length; i++) {
      // STATUS
      switch(products[i].status) {
        case 'draft': {data.draft += 1} break
        case 'active': {data.active += 1} break
        case 'archived': {data.archived += 1} break
        default: { throw `Product status '${products[i].status}' unknown` }
      }
      // PRODUCT TYPE
      switch(products[i].product_type) {
        case 'Movie': {data.movies += 1} break
        case 'TV Series': {data.tvShows += 1} break
        default: {
          data.unknownProductType.push({
            id: products[i].id,
            title: products[i].title,
            product_type: products[i].product_type,
          })
        } break
      }
      // TAGS
      const tags = products[i].tags.split(', ')
      if (tags.length) {
        tags.forEach(t => {
          if (!t.includes('Release Year')) {
            if (!data.tags[t]) data.tags[t] = {count: 1}
            else data.tags[t].count += 1
          }
        })
      } else {
        data.missingTags.push({
          id: products[i].id,
          title: products[i].title,
          tags: products[i].tags,
        })
      }
      // PRICE & STOCK
      const prices = products[i].variants.map(x => x.price)
      prices.forEach(p => {
        if (!data.prices[p]) data.prices[p] = {count: 1}
        else data.prices[p].count += 1
        const price = parseFloat(p)
        if (p > data.highestPrice) data.highestPrice = price
        if (data.lowestPrice == null) data.lowestPrice = price
        if (price < data.lowestPrice) data.lowestPrice = price
      })
      products[i].variants.forEach(v => {
        data.inStock += v.inventory_quantity
        const price = parseFloat(v.price)
        data.inStockValue += v.price*v.inventory_quantity
      })
      // UPDATED DATE
      if (!data.latestUpdateProduct.date) {
        data.latestUpdateProduct.date = new Date(products[i].updated_at)
        data.latestUpdateProduct.id = products[i].id
        data.latestUpdateProduct.title = products[i].title

        data.oldestUpdatedProduct.date = new Date(products[i].updated_at)
        data.oldestUpdatedProduct.id = products[i].id
        data.oldestUpdatedProduct.title = products[i].title
      } else {
        if (new Date(products[i].updated_at) > data.latestUpdateProduct.date) {
          data.latestUpdateProduct.date = new Date(products[i].updated_at)
          data.latestUpdateProduct.id = products[i].id
          data.latestUpdateProduct.title = products[i].title
        }
        if (new Date(products[i].updated_at) < data.oldestUpdatedProduct.date) {
          data.oldestUpdatedProduct.date = new Date(products[i].updated_at)
          data.oldestUpdatedProduct.id = products[i].id
          data.oldestUpdatedProduct.title = products[i].title
        }
      }
      // IMAGES
      if (!products[i].images.length) data.missingImages.push({
        id: products[i].id,
        title: products[i].title,
      })
    }
    return data;
  }
  generateProductAudioReport(data) {
    let report = []
    report = report.concat(this.audioProductBase(data))
    report = report.concat(this.audioProductPrice(data))
    report = report.concat(this.audioProductTagsSimple(data))
    report = report.concat(this.audioProductTagsDetailed(data))
    return report.join(' ')
  }
  audioProductBase(data) {
    const report = []
    if (!data.count) {
      const torts = ['You have no products fuck face.','I do not see any products.','I cannot report on products I do not see.','Come back when you have products to report on shit for brains.']
      return torts[Math.floor(Math.random() * torts.length)]
    }
    if (data.count === 1) {
      report.push('Wow, congratulations, you have one product.')
      if (!data.active) report.push('Better yet, your one measly pitiful product is not even activated.')
      return report.join(' ')
    }

    // STATUS AND PRODUCT TYPE
    report.push(`There are currently ${data.count} products.`)
    report.push(`${data.active} are active, ${data.draft} are draft and ${data.archived} archived.`)
    report.push(`There are ${data.movies} ${data.movies === 1 ? 'movie' : 'movies'} and ${data.tvShows} ${data.tvShows === 1 ? 'television show' : 'television shows'}.`)
    if (data.unknownProductType.lengths) {
      report.push(`Somehow ${data.unknownProductType.length} products are not a movie or show.`)
    }
    return report
  }
  audioProductTagsSimple(data) {
    const report = []
    const tags = Object.keys(data.tags)
    report.push(`There are ${tags.length} unique tags applied to all products, not including release year.`)
    let appliedTagTotal = 0
    for (let tag in data.tags) {
      appliedTagTotal += data.tags[tag].count
    }
    report.push(`Those ${tags.length} tags are applied ${appliedTagTotal} times across all products.`)
    return report
  }
  audioProductTagsDetailed(data) {
    const report = []
    // loop through tags for highest tag first
    const highestTag = {
      name: null,
      value: 0
    }
    for (let tag in data.tags) {
      if (!highestTag.name) {
        highestTag.name = tag
        highestTag.value = data.tags[tag].count
      } else {
        if (data.tags[tag].count > highestTag.value) {
          highestTag.name = tag
          highestTag.value = data.tags[tag].count
        }
      }
    }
    // reporting time
    for (let tag in data.tags) {
      const genericTemplates = ['The tag $TAG occurs $VALUE times.','$TAG has $VALUE instances.','$TAG is coming in at $VALUE.','tag $TAG has a total of $VALUE.','$TAG equals $VALUE.','$TAG has $VALUE.','$TAG has $VALUE.','$TAG has $VALUE.','$TAG has $VALUE.','$TAG has $VALUE.','$TAG has $VALUE.']
      const singleDigitTemplates = ['$TAG has just $VALUE.','Tag $TAG has only $VALUE.','$TAG trailing in at just $VALUE.','$TAG has just $VALUE. Ha ha ha ha.','$TAG has a pathetic $VALUE instance.']
      const highestTemplates = ['$TAG has a whopping $VALUE instances.','Drumroll please. Tag $TAG has the highest occurrences at $VALUE.']
      if (data.tags[tag].count === 1) {
        let template = singleDigitTemplates[Math.floor(Math.random() * singleDigitTemplates.length)]
        report.push(template.replace('$TAG', tag).replace('$VALUE', data.tags[tag].count))
      } else {
        if (tag === highestTag.name) {
          let template = highestTemplates[Math.floor(Math.random() * highestTemplates.length)]
          report.push(template.replace('$TAG', tag).replace('$VALUE', data.tags[tag].count))
        } else {
          let template = genericTemplates[Math.floor(Math.random() * genericTemplates.length)]
          report.push(template.replace('$TAG', tag).replace('$VALUE', data.tags[tag].count))
        }
      }
    }

    return report
  }
  audioProductPrice(data) {
    /*
      Need to pull InventoryItem from shopify in order to get current stock, in
      turn the metric of how much $ we have available at the moment
    */
    const report = []
    let pricePoints = Object.keys(data.prices)
    report.push(`Across your ${data.count} products, ${data.inStock} are in stock, totaling a net sum of ${parseInt(data.inStockValue)} dollars.`)
    if (pricePoints === 1) {
      report.push(`You have only 1 price point which is ${pricePoints[0].replace('.', ' ')}.`)
    } else {
      let pricePointTextArr = pricePoints.map(x => {return x.replace('.', ' ')})
      pricePointTextArr[pricePointTextArr.length-1] = `and ${pricePointTextArr[pricePointTextArr.length-1]}`
      console.log(pricePointTextArr)
      report.push(`The price points are ${pricePointTextArr.join(' ')}.`)
      let i = 0
      for (let price in data.prices) {
        if (i === 0) report.push(`There are ${data.prices[price].count} priced at ${price.replace('.', ' ')}.`)
        else {
          if ((i+1) === pricePoints.length) report.push(`Finally, ${data.prices[price].count} at ${price.replace('.', ' ')}.`)
          else report.push(`${data.prices[price].count} at ${price.replace('.', ' ')}.`)
        }
        i++
      }
    }
    return report
  }
}

nodeUtil.inherits(Reports, EventEmitter)

module.exports = Reports
