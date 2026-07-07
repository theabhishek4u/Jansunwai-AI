const fs = require('fs');
const path = require('path');

const filePath = path.join('server', 'src', 'db', 'mockDb.ts');
let code = fs.readFileSync(filePath, 'utf8');

if (!code.includes('require(\'fs\')') && !code.includes('import fs from')) {
  // Add fs import
  code = code.replace('import { v4 as uuidv4 } from \'uuid\';', 'import { v4 as uuidv4 } from \'uuid\';\nimport fs from \'fs\';\nimport path from \'path\';');

  // Insert Persistence Loading Logic
  const persistenceLogic = `
// --- PERSISTENCE LOGIC ---
const DB_FILE = path.join(process.cwd(), 'data', 'mock_suggestions.json');
try {
  if (fs.existsSync(DB_FILE)) {
    const rawData = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(rawData);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const existingIds = new Set(suggestions.map(s => s.id));
      parsed.reverse().forEach(p => {
        if (!existingIds.has(p.id)) {
          suggestions.unshift(p);
        }
      });
    }
  } else {
    if (!fs.existsSync(path.dirname(DB_FILE))) {
      fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(suggestions, null, 2));
  }
} catch (err) {
  console.error('Failed to load mock DB:', err);
}

const saveSuggestions = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(suggestions, null, 2));
  } catch (err) {
    console.error('Failed to save mock DB:', err);
  }
};
// -------------------------

export const mockDb = {`;

  code = code.replace('export const mockDb = {', persistenceLogic);

  // Hook into createSuggestion
  code = code.replace('suggestions.unshift(newSuggestion);', 'suggestions.unshift(newSuggestion);\n    saveSuggestions();');

  // Hook into updateSuggestionStatus
  code = code.replace('suggestion.status = status;\n      suggestion.updated_at = new Date().toISOString();', 'suggestion.status = status;\n      suggestion.updated_at = new Date().toISOString();\n      saveSuggestions();');

  fs.writeFileSync(filePath, code);
  console.log('Successfully added persistence to mockDb.ts');
}
