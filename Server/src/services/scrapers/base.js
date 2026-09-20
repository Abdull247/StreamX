const https = require('https');
const http = require('http');
const { URL } = require('url');
const zlib = require('zlib');

function fetchPage(url, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const isHttps = parsed.protocol === 'https:';
    const lib = isHttps ? https : http;

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Connection': 'close',          // force close so no keep-alive weirdness
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Upgrade-Insecure-Requests': '1',
      ...extraHeaders
    };

    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers,
      timeout: 20000,
      rejectUnauthorized: false       // some Termux environments need this
    };

    const req = lib.request(options, (res) => {
      // follow one redirect
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : `\( {parsed.protocol}// \){parsed.host}${res.headers.location}`;
        return fetchPage(next, extraHeaders).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        reject(new Error(`Status ${res.statusCode}`));
        return;
      }

      const chunks = [];
      let stream = res;

      const encoding = (res.headers['content-encoding'] || '').toLowerCase();
      if (encoding === 'gzip') stream = res.pipe(zlib.createGunzip());
      else if (encoding === 'deflate') stream = res.pipe(zlib.createInflate());
      else if (encoding === 'br') stream = res.pipe(zlib.createBrotliDecompress());

      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        resolve(body);
      });
      stream.on('error', reject);
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });

    req.end();
  });
}

module.exports = { fetchPage };
