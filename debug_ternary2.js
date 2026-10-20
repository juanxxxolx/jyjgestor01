const fs = require('fs');

const filePath = 'C:/Users/juan M/OneDrive/Escritorio/proyecto_jyjgestor/frontend/src/pages/Productos/index.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find the start of the problematic ternary
const startIdx = content.indexOf('...(isAdmin ? [{');
if (startIdx === -1) {
    console.log('Could not find ternary start');
    process.exit(1);
}

// Look at content after startIdx
console.log(content.substring(startIdx, startIdx + 1500));