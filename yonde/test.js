const yonde = require('./yonde.js')

//yonde.loadDefinitions()

search('what')
async function search(term) {
	const defs = getDefinitions()
	const scores = score()	
	function getDefinitions() {
		return [
  	  {
       "action": "currentTime",
      	"terms": [
           ["what","time","is","it"]
         ],
				 "triggerWords": ["time"],
         "type": "command"
      },
      {
        "action": "retort",
        "terms": ["hey","yo","oi","aibo"],
        "type": "response",
				"limitation": "allHit"
      },
			/*{
				"action": "reply",
				"terms": ["what"],
				"type": "response"
			}*/
    ]
	}
	function score() {
		const result = []
		for (let i = 0; i < defs.length; i++) {
			console.log(`on action '${defs[i].action}'`)
		}
		return result
	}
}
/*
	term 'what' should not hit action 'currentTime'. if the trigger word(s) arent hit, its invalid

	term "hey where are you" should not hit action 'retort'. lets add some kind of limitation... IE all words must be hit in order to to be valid.
*/
