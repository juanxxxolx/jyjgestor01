const fs = require('fs');

const filePath = 'C:/Users/juan M/OneDrive/Escritorio/proyecto_jyjgestor/frontend/src/pages/Productos/index.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find the Table component's columns prop
const tableColumns = content.indexOf('columns={[');

if (tableColumns !== -1) {
    // Print from that position to end of file
    console.log(content.substring(tableColumns));
}