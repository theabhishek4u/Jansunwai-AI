const fs = require('fs');
const path = require('path');

const replacements = [
  { from: /bg-\[size:4rem_4rem\]/g, to: 'bg-size-[4rem_4rem]' },
  { from: /blur-\[40px\]/g, to: 'blur-2xl' },
  { from: /bg-gradient-to-r/g, to: 'bg-linear-to-r' },
  { from: /bg-gradient-to-tr/g, to: 'bg-linear-to-tr' },
  { from: /bg-gradient-to-br/g, to: 'bg-linear-to-br' },
  { from: /z-\[100\]/g, to: 'z-100' },
  { from: /z-\[90\]/g, to: 'z-90' }
];

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      for (const req of replacements) {
        content = content.replace(req.from, req.to);
      }
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log('Fixed Tailwind classes in:', fullPath);
      }
    }
  }
}
replaceInDir('c:/Users/theab/Desktop/Jansunwai/client/src');
