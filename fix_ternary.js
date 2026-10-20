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

console.log('Found ternary from', startIdx, 'to', endIdx);

// Extract the bad section
const badSection = content.substring(startIdx, endIdx + 4);
console.log('Bad section length:', badSection.length);

// The issue: the render function has ') : null,' which breaks the ternary
// We need to change ') : null,' to just ')' and add '] : null),' after the object

// Replace the bad pattern
// The render function ends with '        </Space>\n      ) : null,\n    ];'
// Should be '        </Space>\n      )\n    }] : null),'

const fixedSection = badSection
    .replace('      ) : null,\n    ];', '      )\n    }] : null),');

if (fixedSection !== badSection) {
    content = content.substring(0, startIdx) + fixedSection + content.substring(endIdx + 4);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed ternary!');
} else {
    console.log('Pattern not matched exactly');
    console.log('Last 100 chars of bad section:');
    console.log(badSection.slice(-100));
}