const fs = require('fs');

const filePath = 'C:/Users/juan M/OneDrive/Escritorio/proyecto_jyjgestor/frontend/src/pages/Productos/index.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// The const columns array is missing its closing ];
// After the spread element, we need to close the outer array
// Find the pattern: '    }] : null),\n\n  const tableLoading'
const pattern = '    }] : null),\n\n  const tableLoading';
const replacement = '    }] : null),\n  ];\n\n  const tableLoading';

const idx = content.indexOf(pattern);
if (idx !== -1) {
    content = content.substring(0, idx) + replacement + content.substring(idx + pattern.length);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed missing array close!');
} else {
    console.log('Pattern not found');
    // Try with different whitespace
    const pattern2 = '    }] : null),\r\n\r\n  const tableLoading';
    const idx2 = content.indexOf(pattern2);
    if (idx2 !== -1) {
        content = content.substring(0, idx2) + replacement + content.substring(idx2 + pattern2.length);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed with CRLF!');
    } else {
        console.log('Pattern not found with CRLF either');
    }
}