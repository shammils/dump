const fs = require('fs-extra')
const klaw = require('klaw')
const path = require('path')
const request = require('./lib/request.js')
const url = require('url')

/*
  Import manifest items from directory
  - read folder(s)
*/

;(async () => {

})()

/*
  We will also read the json here and determine if the content is good enough to
  post to <wherever>. Also check image.
    - prioritize 'base' property which does not exist yet
*/
async function scanDir() {
  new Promise((resolve, reject) => {
    klaw('/some/dir')
    .on('readable', function () {
      let item
      while ((item = this.read())) {
        items.push(item.path)
      }
    })
    .on('end', () => {

    })
  })
}
