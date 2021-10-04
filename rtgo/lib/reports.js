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
    - last one created
    - most expensive
    - cheapest
    - tag allocation
      - how many tags hit
      - most and least popular tag(ignore 'Release Year:YYYY')
    ****
    - smallest image
    - largest image
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
      tags: {}
    }
    if (!products) return data
    data.count = products.length
    for (let i = 0; i < products.length; i++) {
      switch(products[i].status) {
        case 'draft': {data.draft += 1} break
        case 'active': {data.active += 1} break
        case 'archived': {data.archived += 1} break
        default: { throw `Product status '${products[i].status}' unknown` }
      }
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
    }
    return data;
  }
  generateProductAudioReport(data) {
    let report = []
    if (!data.count) {
      const torts = ['You have no products fuck face.','I do not see any products.','I cannot report on products I do not see.','Come back when you have products to report on shit for brains.']
      return torts[Math.floor(Math.random() * torts.length)]
    }
    if (data.count === 1) {
      report.push('Wow, congratulations, you have one product.')
      if (!data.active) report.push('Better yet, your one measly pitiful product is not even activated.')
      return report.join(' ')
    }

    report.push(`There are currently ${data.count} products.`)
    report.push(`${data.active} are active, ${data.draft} are draft and ${data.archived} archived.`)
    report.push(`There are ${data.movies} ${data.movies === 1 ? 'movie' : 'movies'} and ${data.tvShows} ${data.tvShows === 1 ? 'television show' : 'television shows'}.`)
    if (data.unknownProductType.lengths) {
      report.push(`Somehow ${data.unknownProductType.length} products are not a movie or show.`)
    }
    return report.join(' ')
  }
}

nodeUtil.inherits(Reports, EventEmitter)

module.exports = Reports
