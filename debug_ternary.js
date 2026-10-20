const fs = require('fs');

const filePath = 'C:/Users/juan M/OneDrive/Escritorio/proyecto_jyjgestor/frontend/src/pages/Productos/index.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find the start of the problematic ternary
const startIdx = content.indexOf('...(isAdmin ? [{');
if (startIdx === -1) {
    console.log('Could not find ternary start');
    process.exit(1);
}

// Find the end of the const columns array (the '    ];' after the ternary)
const endIdx = content.indexOf('    ];', startIdx);
if (endIdx === -1) {
    console.log('Could not find array end');
    process.exit(1);
}

// Extract the bad section
const badSection = content.substring(startIdx, endIdx + 4);
console.log('Bad section:');
console.log(badSection.slice(-200));