const fs = require('fs');

const filePath = 'C:/Users/juan M/OneDrive/Escritorio/proyecto_jyjgestor/frontend/src/pages/Productos/index.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find the Table component's columns prop
const tableColumns = content.indexOf('columns={[');

if (tableColumns !== -1) {
    // Find the end pattern with CRLF
    const endPattern = '],\r\n        }\r\n      />';
    const endPos = content.indexOf(endPattern, tableColumns);
    
    if (endPos !== -1) {
        const end = endPos + endPattern.length;
        content = content.substring(0, tableColumns) + 'columns={columns} />' + content.substring(end);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed Table columns prop');
    } else {
        console.log('Could not find end pattern');
        // Try alternative patterns
        const alt1 = content.indexOf('],\r\n      />', tableColumns);
        const alt2 = content.indexOf(']}\r\n      />', tableColumns);
        const alt3 = content.indexOf('], } />', tableColumns);
        console.log('Alt1 (],\r\n      />):', alt1);
        console.log('Alt2 (]}\r\n      />):', alt2);
        console.log('Alt3 (], } />):', alt3);
    }
} else {
    console.log('Could not find columns={[');
}