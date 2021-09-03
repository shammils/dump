const fs = require('fs')
const klaw = require('klaw')
const path = require('path')
const nodeUtil = require('util')
const EventEmitter = require('events').EventEmitter
let definitions = []
let info = {}

let _self

const chainWords = ["at","for","in"]

function log(level, message) { _self.emit("log",{module:'yonde',level,message})}

class Yonde {
	constructor() {
		_self = this
		EventEmitter.call(this)
		this.definitions = []
	}
	search(term) {
	  const res = this.findAction(term)
	  if (res.atari) {
	    if (res.atari.definition.queryType === 'dynamic') {
	      /*
					'how many sales at/for/in <sitename>'
					hard to write a 100% working block of code to always pluck the value we
					want in this case.
				*/
				// TODO-TABUN: find the closest matching data object from char hits/order
				// TODO-TABUN: hit on nearest character, IE 'hit' vs 'hir' vs 'git' vs 'hot' vs 'hiy'. these are all one char off and the char is next to the intended char
				// loop through all the missed words and see if we find something in the
				// the data object
				let subject
				if (res.atari.missedWords && res.atari.missedWords.length) {
					for (let prop in info) {
						const word = res.atari.missedWords.find(w => w === prop.toLowerCase())
						if (word) subject = info[prop]
					}
				}
				if (subject) {
					res.atari.subject = subject
				}
	    }
	  } else {
			// didnt get a perfect match so we can check scores and ? at this point
		}

	  return res
	}
	findAction(term) {
		if (!this.definitions.length) throw `no definitions loaded`
		const results = { atari: null, other: [] }
		if (!term || !term.length) return results
		const terms = term.toLowerCase().trim().split(' ')
		for (let di = 0; di < this.definitions.length; di++) {
			if (results.atari) break
			const result = {
				action: this.definitions[di].action,
				term,
				definition: this.definitions[di]
			}
			log('debug', `term '${term}', on action '${this.definitions[di].action}'`)
			if (this.definitions[di].matchType === 'basic') {
				result.hits = 0
				result.misses = 0
				// failing to take conditions into account atm
				log('debug', `term '${term}', action  '${this.definitions[di].action}' is basic, order will not be taken into account`)
				// loop through passed in terms
				for (let ti = 0; ti < terms.length; ti++) {
					if (this.definitions[di].terms.includes(terms[ti])) { result.hits += 1 }
					else { result.misses += 1 }
				}
				if (result.hits > 0 && result.misses === 0) {
					results.atari = result
				} else {
					result.valid = false
					results.other.push(result)
				}
			} else {
				result.score = 0
				result.matchedWords = []
				result.missedWords = []
				// complex is the only other option
				log('debug', `term '${term}', action '${this.definitions[di].action}' is complex, will take order into account`)
				// process conditions
				let conditionsMet = true
				for (let ci = 0; ci < this.definitions[di].conditions.length; ci++) {
				  const cond = this.definitions[di].conditions[ci]
				  if (typeof cond === 'object' && cond.type === 'mustContain') {
				    for (let cvi = 0; cvi < cond.values.length; cvi++) {
				      if (!terms.includes(cond.values[cvi])) {
				        conditionsMet = false
				        break
				      }
				    }
				  }
				}
				if (!conditionsMet) {
				  log('debug', `term '${term}', action '${this.definitions[di].action}' failed to meet conditions`)
				  //continue
				}
				// score

				// first see how many words matched
				let scoreCriteriaCount = 2 // matched words and word order
				let matchedWordScore
				// loop through terms to find matches
				for (let ti = 0; ti < terms.length; ti++) {
					log('debug', `term '${term}', action '${this.definitions[di].action}' 0${terms[ti]} 1${this.definitions[di].terms.includes(terms[ti])} 2${!result.matchedWords.includes(terms[ti])}`,this.definitions[di].terms)
					if (this.definitions[di].terms.includes(terms[ti]) && !result.matchedWords.includes(terms[ti])) {
						result.matchedWords.push(terms[ti])
					} else {
						// add non 'ni' article words to different array
						if (!chainWords.includes(terms[ti].toLowerCase())) result.missedWords.push(terms[ti])
					}
				}
				matchedWordScore = result.matchedWords.length / this.definitions[di].terms.length * 100

				// second see how many words matched the order
				let wordsInOrder = 0
				let ti = 0
				let wordOrderScore
				while(ti < this.definitions[di].terms.length && ti < terms.length) {
					if (this.definitions[di].terms[ti] === terms[ti]) wordsInOrder += 1
					ti += 1
				}
				wordOrderScore = wordsInOrder / this.definitions[di].terms.length * 100
				const averageAverage = (matchedWordScore+wordOrderScore)/scoreCriteriaCount
				log('debug', `term '${term}', action '${this.definitions[di].action}': MWS: ${matchedWordScore}%, WOS:${wordOrderScore}% final score: ${averageAverage}%`)

				result.score = averageAverage
				// for now, if averageAverage is 100, success(duh)
				if (averageAverage === 100) results.atari = result
			}
		}
		log('debug', `term '${term}',  results: ${JSON.stringify(results)}`)
		return results
	}
	// TODO: break out conditions and scoring
	search_evaluateConditions() {}
	search_score() {}
	async loadDefinitions() {
		return new Promise((resolve, reject) => {
			klaw('./data')
			.on('readable', function () {
				let item
				while ((item = this.read())) {
					if (path.extname(item.path) === '.json') {

					  const obj = JSON.parse(fs.readFileSync(item.path, {encoding:'utf8'}))
					  if (Array.isArray(obj)) {
					    _self.definitions = _self.definitions.concat(obj)
					  } else {
					    for (let prop in obj) info[prop] = obj[prop]
					  }
					}
				}
			})
			.on('end', resolve)
		})
	}
}

nodeUtil.inherits(Yonde, EventEmitter)

module.exports = Yonde
