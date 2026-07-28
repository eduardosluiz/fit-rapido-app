const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const origContent = content;

  // Replace class combinations in page.tsx forms:
  content = content.replace(/className="([^"]*)text-sm([^"]*)text-gray-900 dark:text-white/g, 
    'className="$1text-xs$2text-gray-700 dark:text-gray-300');

  content = content.replace(/className="([^"]*)text-sm([^"]*)text-gray-800 dark:text-white/g, 
    'className="$1text-xs$2text-gray-700 dark:text-gray-300');
    
  if (content !== origContent) {
    fs.writeFileSync(file, content);
    changedFiles++;
    console.log('Updated', file);
  }
});

console.log('Total files changed:', changedFiles);
