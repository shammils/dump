const fs = require('fs')
let definitions
// TODO: manage context. can only do this once yonde is responding somewhat properly
let currentContext

// TODO: make this a class
const api = {
	loadDefinitions: async () => {
		definitions = fs.readFileSync('./definitions.json', {encoding:'utf8'})
		console.log('defs', JSON.parse(definitions))
	},
	search: async (term) => {
		throw 'unimplemented'
	}
}

module.exports = api
