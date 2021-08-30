const fs = require('fs')
const klaw = require('klaw')
const path = require('path')
const nodeUtil = require('util')
const EventEmitter = require('events').EventEmitter
let definitions = []
// TODO: manage context. can only do this once yonde is responding somewhat properly
let currentContext
let _self

function log(level, message) { _self.emit("log",{module:'yonde',level,message})}

class Yonde {
	constructor() {
		_self = this
		EventEmitter.call(this)
		this.definitions = []
	}
	search(term) {
		if (!this.definitions.length) throw `no definitions loaded`
		const results = { atari: null, other: [] }
		if (!term || !term.length) return results
		const terms = term.toLowerCase().trim().split(' ')
		for (let di = 0; di < this.definitions.length; di++) {
			if (results.atari) break
			const result = {
				action: this.definitions[di].action,
				term
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
				let matchedWords = []
				let scoreCriteriaCount = 2 // matched words and word order
				let matchedWordScore
				for (let ti = 0; ti < terms.length; ti++) {
					log('debug', `term '${term}', action '${this.definitions[di].action}' 0${terms[ti]} 1${this.definitions[di].terms.includes(terms[ti])} 2${!matchedWords.includes(terms[ti])}`,this.definitions[di].terms)
					if (this.definitions[di].terms.includes(terms[ti]) && !matchedWords.includes(terms[ti])) {
						matchedWords.push(terms[ti])
					}
				}
				matchedWordScore = matchedWords.length / this.definitions[di].terms.length * 100

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
			klaw('./definitions')
			.on('readable', function () {
				let item
				while ((item = this.read())) {
					if (path.extname(item.path) === '.json') {
						_self.definitions = _self.definitions.concat(
							JSON.parse(fs.readFileSync(item.path, {encoding:'utf8'}))
						)
					}
				}
			})
			.on('end', resolve)
		})
	}
}

nodeUtil.inherits(Yonde, EventEmitter)

module.exports = Yonde
