const yonde = require('./yonde.js')

//yonde.loadDefinitions()

// should perfectly hit 'reply' action with 100% accuracy
processRequest('oi')

// should return no results, hit 'currentTime' with a score of less than 25% but more than 0%
processRequest('what')

//processRequest('what is it')
async function processRequest(term) {
	const defs = getDefinitions()
	const response = search()
	function getDefinitions() {
		return [
  	  {
       "action": "currentTime",
      	"terms": ["what","time","is","it"],
				"matchType": "complex",
				 "conditions": [
					 {
						 "type": "mustContain",
						 "values": ["time"]
					 },
					 { // not sure about this
						 "type": "mustExist",
						 "position": 0,
						 "value": "what"
					 }
				 ],
         "actionType": "command"
      },
      {
        "action": "retort",
        "terms": ["hey","yo","oi","aibo"],
				"matchType": "basic",
        "actionType": "response",
				"conditions": ["allMatch"]
      },
			/*{
				"action": "reply",
				"terms": ["what"],
				"type": "response"
			}*/
    ]
	}
	function search() {
		const terms = term.toLowerCase().trim().split(' ')
		const results = { atari: null, other: [] }
		for (let di = 0; di < defs.length; di++) {
			if (results.atari) break
			const result = {
				action: defs[di].action,
				score: 0, // irrelevant for now
				hits: 0,
				misses: 0,
			}
			console.log(`term '${term}', on action '${defs[di].action}'`)
			if (defs[di].matchType === 'basic') {
				// failing to take conditions into account atm
				console.log(`term '${term}', action  '${defs[di].action}' is basic, order will not be taken into account`)
				// loop through passed in terms
				for (let ti = 0; ti < terms.length; ti++) {
					if (defs[di].terms.includes(terms[ti])) { result.hits += 1 }
					else { result.misses += 1 }
				}
				if (result.hits > 0 && result.misses === 0) {
					results.atari = result
				} else {
					result.valid = false
					results.other.push(result)
				}
			} else {
				// complex is the only other option
				console.log(`term '${term}', action '${defs[di].action}' is complex, will take order into account`)
				// process conditions
				let conditionsMet = true
				for (let ci = 0; ci < defs[di].conditions.length; ci++) {
				  const cond = defs[di].conditions[ci]
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
				  console.log(`term '${term}', action '${defs[di].action}' failed to meet conditions`)
				  //continue
				}
				// score

				// first see how many words matched
				let matchedWords = []
				let matchedWordScore
				for (let ti = 0; ti < terms.length; ti++) {
					console.log(`term '${term}', action '${defs[di].action}' 0${terms[ti]} 1${defs[di].terms.includes(terms[ti])} 2${!matchedWords.includes(terms[ti])}`,defs[di].terms)
					if (defs[di].terms.includes(terms[ti]) && !matchedWords.includes(terms[ti])) {
						matchedWords.push(terms[ti])
					}
				}
				matchedWordScore = matchedWords.length / defs[di].terms.length * 100

				// second see how many words matched the order
				let wordsInOrder = 0
				let ti = 0
				let wordOrderScore
				while(ti < defs[di].terms.length && ti < terms.length) {
					if (defs[di].terms[ti] === terms[ti]) wordsInOrder += 1
					ti += 1
				}
				wordOrderScore = wordsInOrder / defs[di].terms.length * 100
				console.log(`term '${term}', action '${defs[di].action}': MWS: ${matchedWordScore}%, WOS:${wordOrderScore}%`)
			}
		}
		console.log(`term '${term}',  results: ${JSON.stringify(results)}`)
		return results
	}
}
/*
	term 'what' should not hit action 'currentTime'. if the trigger word(s) arent hit, its invalid

	term "hey where are you" should not hit action 'retort'. lets add some kind of limitation... IE all words must be hit in order to to be valid.
*/
