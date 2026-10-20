const fs = require('fs');

const filePath = 'C:/Users/juan M/OneDrive/Escritorio/proyecto_jyjgestor/frontend/src/pages/Productos/index.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace the duplicate columns in Table with the columns variable
// Find "columns={[" and replace until "]} />"
const start = content.indexOf('columns={[');
if (start !== -1) {
    // Find the matching "]} />"
    let braceCount = 0;
    let inString = false;
    let stringChar = '';
    let end = -1;
    
    for (let i = start; i < content.length; i++) {
        const ch = content[i];
        const nextCh = content[i + 1];
        
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
                if (braceCount === 0 && nextCh === '}' && content[i + 2] === ' ' && content[i + 3] === '/' && content[i + 4] === '>') {
                    end = i + 5;
                    break;
                }
            }
        }
    }
    
    if (end !== -1) {
        content = content.substring(0, start) + 'columns={columns} />' + content.substring(end);
    }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed');