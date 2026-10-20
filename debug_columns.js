const fs = require('fs');

const filePath = 'C:/Users/juan M/OneDrive/Escritorio/proyecto_jyjgestor/frontend/src/pages/Productos/index.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find the Table component's columns prop
const tableColumns = content.indexOf('columns={[');

if (tableColumns !== -1) {
    console.log('Found at position:', tableColumns);
    console.log('Line ~', content.substring(0, tableColumns).split('\n').length);
    
    // Print from that position
    console.log('\nContent from that position:');
    console.log(content.substring(tableColumns, tableColumns + 500));
}