const fs = require('fs-extra')
const klaw = require('klaw')
const path = require('path')

const winGex =  /[<>:"\/\\|?*]+/g

const sourceDir = process.env.SOURCEDIR
const targetDir = process.env.TARGETDIR

;(async () => {
  // get source dir from process.env.SOURCEDIR
  // target dir is process.env.TARGETDIR
  const res = await scanDir(sourceDir)
})()

/*
  cover.ext has highest priority
  imdb_full_<int>.ext has next priority

  basically fuck everything else

  TODO:
    - support thumbnails and shit
    - check for minimum image sizes and report on values that break threshold

  - read all of the images that meet the supported requirements
  - rename them to *WASHED* product name
  - put in one folder. if overwriting happens, so what
*/
async function scanDir(dir) {
  new Promise((resolve, reject) => {
    klaw(dir)
    .on('readable', async function () {
      let item
      while ((item = this.read())) {
        let hit = false
        let data
        const fileObj = path.parse(item.path)
        if (fileObj.ext.toLowerCase() === '.png' ||
        fileObj.ext.toLowerCase() === '.jpg' ||
        fileObj.ext.toLowerCase() === '.jpeg') {
          console.log(`found image: ${item.path}`)
          console.log(fileObj)
          if (!data) {
            let infoPath = `${fileObj.dir.split('metadata')[0]}info.json`
            console.log(`path: ${infoPath}`)
            try {
              data = await fs.readJson(infoPath)
              console.log('sv', data.schemaVersion)
            } catch(err) {}
          }
          // highest priority
          if (item.path.endsWith(`cover${fileObj.ext}`)) {
            hit = true
          }
          // second highest
          if (!hit && fileObj.name.startsWith(`cover_full_`)) {
            console.log('ddd')
            hit = true
          }
          console.log(`hit:${hit}, d:${typeof data}, p: ${item.path}`)
          if (hit && data) {
            console.log('got image and data')
          }
        }
      }
    })
    .on('end', () => {

    })
  })
}
