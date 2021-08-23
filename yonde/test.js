const yonde = require('./yonde.js')

//yonde.loadDefinitions()

// should perfectly hit 'reply' action with 100% accuracy
processRequest('oi')

// should return no results, hit 'currentTime' with a score of less than 25% but more than 0%
//search('what')
async function processRequest(term) {
	const defs = getDefinitions()
	const response = search()	
	function getDefinitions() {
		return [
  	  {
       "action": "currentTime",
      	"terms": [
           ["what","time","is","it"]
         ],
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
		const terms = term.trim().split(' ')
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
