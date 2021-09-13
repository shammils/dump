const { http, https } = require('follow-redirects');
const fs = require('fs')

const api = (type, request, payload = false) =>
  new Promise((resolve, reject) => {
    const query = Object.assign({}, request);
    if (payload) {
      query.headers = {
        ...query.headers,
        'Content-Length': Buffer.byteLength(payload),
      };
    }
    let client = http
    if (type==='https') client = https
    const req = client.request(query, res => {
      /*if (res.statusCode < 200 || res.statusCode > 399) {
        fs.writeFileSync('error.txt', res.statusMessage, 'utf8')
        console.log(res.statusMessage)
        reject(Object.assign(new Error(`Failed to load page, status code: ${res.statusCode}`), {
          context: {
            body: payload,
            request,
          },
        }));
      }*/
      const body = [];
      res.on('data', body.push.bind(body));
      res.on('end', () => {
        resolve(JSON.stringify({
          body: JSON.parse(Buffer.from(Buffer.concat(body))),
          headers: res.headers,
        }))
      });
    });
    req.on('error', err => {
      console.log('error in request lib')
      reject(err)
    });
    if (payload) req.write(payload);
    req.end();
  });

module.exports = api;
