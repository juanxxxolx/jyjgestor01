c/**
 * SCRIPT DE DIAGNÓSTICO - Abre este en la consola (F12)
 * Cópialo y pégalo en la consola del navegador (F12 -> Console)
 */

console.log('🔍 === DIAGNÓSTICO DE CONEXIÓN ===\n');

// 1. Verificar si api.js está cargado
console.log('1. ¿Está cargado api.js?');
if (typeof api !== 'undefined') {
    console.log('   ✅ SÍ - api.js está disponible');
} else {
    console.log('   ❌ NO - Falta incluir <script src="../frontend/shared/api.js"></script>');
}

// 2. Verificar si hay token
console.log('\n2. ¿Hay token de autenticación?');
const token = localStorage.getItem('token');
if (token) {
    console.log('   ✅ SÍ - Token presente:', token.substring(0, 20) + '...');
} else {
    console.log('   ⚠️  NO - Necesitas hacer login primero');
}

// 3. Intentar conectar a servidor
console.log('\n3. Intentando conectar a servidor...');
fetch('http://localhost:3000/api/productos', {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    }
})
    .then(res => {
        console.log(`   ✅ Respuesta: ${res.status} ${res.statusText}`);
        return res.json();
    })
    .then(data => {
        console.log('   Datos:', data);
    })
    .catch(err => {
        console.log(`   ❌ Error: ${err.message}`);
        console.log('   Soluciones:');
        console.log('   1. ¿MySQL está corriendo?');
        console.log('   2. ¿npm start está activo en la terminal?');
        console.log('   3. ¿El puerto 3000 está abierto?');
        console.log('   4. Abre http://localhost:3000 en el navegador');
    });

// 4. Listar problemas comunes
console.log('\n4. Checklist de problemas comunes:');
const checks = [
    ['MySQL corriendo', '¿XAMPP está activo?'],
    ['npm start activo', '¿Terminal muestra "escuchando en puerto 3000"?'],
    ['api.js incluido en HTML', '¿<script src="../frontend/shared/api.js"></script>?'],
    ['Token válido', '¿Hiciste login?'],
    ['CORS habilitado', 'Revisa backend/config.js']
];

checks.forEach(([name, hint], i) => {
    console.log(`   ${i + 1}. ${name}: ${hint}`);
});

console.log('\n5. Info del navegador:');
console.log(`   URL: ${window.location.href}`);
console.log(`   Usuario: ${localStorage.getItem('usuario')}`);
