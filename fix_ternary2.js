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

// The issue: the render function has ') : null,' which breaks the ternary
// We need to change ') : null,' to just ')' and add '] : null),' after the object

// Find the exact position of ') : null,' within the bad section
const nullPos = badSection.indexOf(') : null,');
if (nullPos === -1) {
    console.log('Could not find ) : null,');
    process.exit(1);
}

console.log('Found ) : null, at position', nullPos, 'in bad section');

// Replace ') : null,\n    ];' with ')\n    }] : null),'
const before = badSection.substring(0, nullPos);
const after = badSection.substring(nullPos + 9); // skip ') : null,'

// Find the '    ];' in the after part
const arrayEndPos = after.indexOf('    ];');
if (arrayEndPos === -1) {
    console.log('Could not find array end in after');
    process.exit(1);
}

const fixedSection = before + ')\n    }] : null),' + after.substring(arrayEndPos + 4);

if (fixedSection !== badSection) {
    content = content.substring(0, startIdx) + fixedSection + content.substring(endIdx + 4);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed ternary!');
} else {
    console.log('No change made');
}