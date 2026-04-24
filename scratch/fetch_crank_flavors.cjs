const https = require('https');

function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  const url = 'https://www.esn.com/products/esn-crank';
  console.log(`Fetching ${url}...`);
  const html = await fetchHTML(url);
  
  const regex = /"name":"(?:Geschmack|Flavor|Flavor \(Limited\))","values":\[(.*?)\]/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
      console.log('Found:', match[1]);
  }
  
  // also check for option1
  const regex2 = /"option1":"([^"]+)"/g;
  let match2;
  const flavors = new Set();
  while ((match2 = regex2.exec(html)) !== null) {
      flavors.add(match2[1]);
  }
  console.log('Option1 values:', Array.from(flavors));
}

run();
