const https = require('https');

function fetchProductJSON(slug) {
  return new Promise((resolve, reject) => {
    https.get(`https://www.esn.com/products/${slug}.js`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  const slugs = ['esn-designer-whey-protein', 'esn-isoclear-whey-isolate', 'esn-crank'];
  
  for (const slug of slugs) {
    const product = await fetchProductJSON(slug);
    if (product && product.options) {
      const flavorOption = product.options.find(o => o.name.toLowerCase().includes('geschmack') || o.name.toLowerCase().includes('flavor'));
      if (flavorOption) {
        console.log(`\nFlavors for ${slug}:`);
        console.log(JSON.stringify(flavorOption.values, null, 2));
      } else {
        console.log(`No flavor option found for ${slug}`);
      }
    } else {
      console.log(`Failed to fetch ${slug}`);
    }
  }
}

run();
