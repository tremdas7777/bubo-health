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

function extractFlavors(html) {
  // Look for Shopify's product JSON
  const regex = /"variants":\[(.*?)\]/g;
  let match;
  const flavors = new Set();
  
  // A simple regex to find "option1" or similar which usually holds the flavor
  // But a better way is to find the script containing the full product JSON.
  const productRegex = /<script type="application\/json" data-product-json>(.*?)<\/script>/s;
  const productMatch = html.match(productRegex);
  
  if (productMatch) {
    try {
      const product = JSON.parse(productMatch[1]);
      const option = product.options.find(o => o.name.toLowerCase().includes('geschmack') || o.name.toLowerCase().includes('flavor'));
      if (option) {
         return option.values;
      }
    } catch(e) {}
  }
  
  // Alternative: match from window.__PRELOADED_STATE__ or similar
  const optionRegex = /"name":"(?:Geschmack|Flavor|Flavor \(Limited\))","values":\[(.*?)\]/g;
  while ((match = optionRegex.exec(html)) !== null) {
      try {
          const values = JSON.parse(`[${match[1]}]`);
          values.forEach(v => flavors.add(v));
      } catch(e) {}
  }
  
  return Array.from(flavors);
}

async function run() {
  const urls = [
    'https://www.esn.com/products/esn-designer-whey-protein',
    'https://www.esn.com/products/esn-isoclear-whey-isolate',
    'https://www.esn.com/products/esn-crank'
  ];
  
  for (const url of urls) {
    console.log(`\nFetching ${url}...`);
    const html = await fetchHTML(url);
    const flavors = extractFlavors(html);
    console.log(`Found ${flavors.length} flavors:`);
    console.log(flavors);
  }
}

run();
