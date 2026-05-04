const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file === 'node_modules' || file === 'dist' || file === '.git') continue;
      replaceInDir(fullPath);
    } else if (fullPath.match(/\.(ts|tsx|json|html|md|css|cjs|js)$/)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content
        .replace(/Bubo Health/gi, 'Bubo Health')
        .replace(/Bubo Health/gi, 'Bubo Health')
        .replace(/Bubo Health Order/gi, 'Bubo Health Order')
        .replace(/Bubo Health CSV/gi, 'Bubo Health CSV')
        .replace(/Bubo Health/gi, 'Bubo Health')
        .replace(/Bubo Health\.com\.br/gi, 'bubohealth.com.br')
        .replace(/Bubo Health/gi, 'bubohealth')
        .replace(/Bubo Health/gi, 'bubohealth');
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log('Updated:', fullPath.replace(process.cwd() + '/', ''));
      }
    }
  }
}

replaceInDir(path.join(__dirname));
console.log('Done!');
