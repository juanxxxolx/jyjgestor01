const fs = require('fs');

const filePath = 'C:/Users/juan M/OneDrive/Escritorio/proyecto_jyjgestor/frontend/src/pages/Productos/index.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find the problematic pattern: ') : null,\n    ];'
const badPattern = ') : null,\n    ];';
const goodPattern = ')\n    }] : null),';

const idx = content.indexOf(badPattern);
if (idx !== -1) {
    content = content.substring(0, idx) + goodPattern + content.substring(idx + badPattern.length);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed!');
} else {
    console.log('Pattern not found');
    // Try with different whitespace
    const badPattern2 = ') : null,\r\n    ];';
    const idx2 = content.indexOf(badPattern2);
    if (idx2 !== -1) {
        content = content.substring(0, idx2) + goodPattern + content.substring(idx2 + badPattern2.length);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed with CRLF!');
    } else {
        console.log('Pattern not found with CRLF either');
    }
}