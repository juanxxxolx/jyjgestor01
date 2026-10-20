const fs = require('fs');

const filePath = 'C:/Users/juan M/OneDrive/Escritorio/proyecto_jyjgestor/frontend/src/pages/Productos/index.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find the Table component's columns prop (the one that starts with "columns={[")
const tableColumns = content.indexOf('columns={[');

if (tableColumns !== -1) {
    // Find the matching "]} />" 
    let braceCount = 0;
    let inString = false;
    let stringChar = '';
    let end = -1;
    
    for (let i = tableColumns; i < content.length; i++) {
        const ch = content[i];
        
        if (!inString && (ch === '"' || ch === "'" || ch === '`')) {
            inString = true;
            stringChar = ch;
        } else if (inString && ch === stringChar && content[i - 1] !== '\\') {
            inString = false;
        } else if (!inString) {
            if (ch === '{' || ch === '[') {
                braceCount++;
            } else if (ch === '}' || ch === ']') {
                braceCount--;
                if (braceCount === 0) {
                    // Check if followed by " />"
                    if (content.substring(i + 1, i + 4) === ' />') {
                        end = i + 4;
                        break;
                    }
                }
            }
        }
    }
    
    if (end !== -1) {
        content = content.substring(0, tableColumns) + 'columns={columns} />' + content.substring(end);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed Table columns prop');
    } else {
        console.log('Could not find end of columns prop');
    }
} else {
    console.log('Could not find columns={[');
}