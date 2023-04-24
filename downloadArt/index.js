// I probably wont need fs-extra, remove if thats the case
const klaw = require('klaw')
const path = require('path')
const { http, https } = require('follow-redirects');
const delay = ms =>
new Promise(resolve =>
  setTimeout(() => resolve(), ms))

;(async () => {
  // needs to support paging
  //const products = await getAllProducts()
  //console.log('products', products)

  //const collections = await getCollections('DesignCollection')
  //console.log('collections', collections)

  //const collection = await getCollectionById('00000000-000000-000000-000000000001')
  //console.log('collection', collection)

  const collections = await scanDir('/home/shigoto/projects/dump/downloadArt/products')
  console.log(collections)
})()

async function getCollectionById(id) {
  return JSON.parse(Buffer.from(
    await request('https', {
      method: 'GET',
      host: 'www.wixapis.com',
      path: `/stores/v1/collections/${id}`,
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      }
    })
  ).toString('utf8'))
}

async function getCollections() {
  return JSON.parse(Buffer.from(
    await request('https', {
      method: 'POST',
      host: 'www.wixapis.com',
      path: '/stores/v1/collections/query',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      }
    }, JSON.stringify({
      query: {}
    }))
  ).toString('utf8'))
}

async function getAllProducts() {
  return JSON.parse(Buffer.from(
    await request('https', {
      method: 'POST',
      host: 'www.wixapis.com',
      path: '/stores/v1/products/query',
      headers: {
        Authorization: token,
      }
    }, JSON.stringify({
      query: {}
    }))
  ).toString('utf8'))
}

async function scanDir(dir) {
  const collections = {}
  return new Promise((resolve, reject) => {
    klaw(dir,{depthLimit:2})
    .on('data', item => {
      // we probably want to verify that we are at depth 2
      // we also might want to check that we dont process images
      // at depth 1
      const thing = path.parse(item.path)
      console.log(thing)
      if (thing.ext.length && (
        thing.ext.toLowerCase() === '.png' ||
        thing.ext.toLowerCase() === '.jpg'
      )) {
        // THIS WONT WORK FOR WINDOWS   |||
        //                              VVV
        const pathArr = thing.dir.split('/')
        const colName = pathArr[pathArr.length-1]
        if (!collections[colName]) collections[colName] = []
        collections[colName].push(item.path)
      }
    })
    .on('end', () => {
      resolve(collections)
    })
  })
}

function request(type, request, payload = false) {
  return new Promise((resolve, reject) => {
    const query = Object.assign({}, request);
    if (payload) {
      query.headers = {
        ...query.headers,
        'Content-Length': Buffer.byteLength(payload),
      };
    }
    const client = type === 'https' ? https : http
    const req = client.request(query, res => {
      if (res.statusCode < 200 || res.statusCode > 399) {
        //console.log('response', Buffer.from(Buffer.concat(body)).toString('utf8'))
        reject(Object.assign(new Error(`Failed to load page, status code: ${res.statusCode}`), {
          context: {
            body: payload,
            request,
          },
        }));
      }
      const body = [];
      res.on('data', body.push.bind(body));
      res.on('end', () => {
        resolve(Buffer.concat(body))
      });
    });
    req.on('error', err => reject(err));
    req.on('socket', socket => {
      socket.setTimeout(30000);
      socket.on('timeout', () => {
        req.abort();
      });
    });
    if (payload) req.write(payload);
    req.end();
  })
}
