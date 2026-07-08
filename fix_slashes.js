const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const original = content;
      
      content = content.replace(/\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| 'http:\/\/localhost:5000'\}\//g, 
        "${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\\/$/, '')}/");
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log('Fixed slashes in:', fullPath);
      }
    }
  }
}
replaceInDir('c:/Users/theab/Desktop/Jansunwai/client/src');
