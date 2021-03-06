// takes a base TV show object and turns its seasons into unique products
const util = require('../lib/util.js')
const fs = require('fs-extra')
const path = require('path')
const spawn = require('child_process').spawn

;(async () => {
  const broken = []
  if (!process.env.SOURCEDIR || !process.env.TARGETDIR) {
    console.log('SOURCEDIR and TARGETDIR are required')
    process.exit(0)
  }
  // SOURCEDIR must be tv shows that havent been split yet
  const paths = await util.fetchInfoFileDirs(process.env.SOURCEDIR)
  console.log('pk', paths.length)
  if (paths.length) {
    await fs.ensureDir(process.env.TARGETDIR)
    for (let i = 0; i < paths.length; i++) {
      const pathObj = path.parse(paths[i])
      const data = await fs.readJson(paths[i])
      const imdb = data.data[`imdb_${data.sources.imdb.version}`]
      // if imdb doesnt exist, let it break
      if (imdb.type === 'TV Series') {
        if (!imdb.seasons || !imdb.seasons.length) {
          broken.push(`missing seasons property. path ${paths[i]}`)
          continue
        }
        // not actually going to read the imdb.seasons[index].season value, just
        // going to go from the array length
        console.log(`expanding '${imdb.title}'`)
        for (let j = 0; j < imdb.seasons.length; j++) {
          console.log(pathObj)
          // create folder in target dir with season number
          const twoCharYear = pathObj.dir.substring(pathObj.dir.length-2)
          if (isNaN(parseInt(twoCharYear))) {
            broken.push(`year '${twoCharYear}' is not at the end of the folder name: ${paths[i]}`)
            continue
          }
          const newPath = path.join(process.env.TARGETDIR, `${util.windowsifyString(imdb.title)}-TV-${twoCharYear}`, `SEASON ${j+1}`)
          await fs.ensureDir(newPath)
          // create folder/info.json file with updated data in target dir
          const clone = JSON.parse(JSON.stringify(data))
          clone.base = {
            title: `${imdb.title} Season ${j+1}`,
            description: imdb.description,
            genres: imdb.genres,
            stars: imdb.stars,
            releaseYear: imdb.releaseYear,
            parentalRating: imdb.parentalRating,
            season: j+1, // look for this property on the create side of things
          }
          // TODO: pluck from wiki
          if (imdb.runtime) clone.base.runtime = imdb.runtime
          if (imdb.director) clone.base.director = imdb.director
          if (imdb.creator) clone.base.creator = imdb.creator
          if (imdb.USReleaseDate) clone.base.USReleaseDate = imdb.USReleaseDate
          // shit, delete shopify property if it exists(not using yet)
          delete clone.shopify
          await fs.writeJson(path.join(newPath, 'info.json'), clone, {spaces:2})

          // copy metadata folder to folder/metadata. should be it?
          await copyFolder(path.join(pathObj.dir, 'metadata'), path.join(newPath, 'metadata'))
          console.log(`path ${i+1}/${paths.length}, season ${j+1}/${imdb.seasons.length} processed`)
        }
      } else {
        console.log(`movie in TV dir. path: ${paths[i]}`)
      }
    }
  } else {
    console.log('no paths returned')
  }
  if (broken.length) {
    console.log(broken.join('\n'))
  }
  process.exit(0)
})()

// put this in util if one other thing references it, but note the code != 0 path
async function copyFolder(from, to) {
  const promise = new Promise((resolve, reject) => {
    const p = spawn('cp', ['-r', from, to]);
    p.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });
    p.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });
    p.on('close', (code) => {
      if (code === 0) resolve();
      else {
        console.log(`received code ${code} attempting to copy file ${from},${to}`)
        process.exit(0)
      }
    });
  });
  return promise;
}
