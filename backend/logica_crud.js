// backend/testRegistro.js

// Importa solo la función del controlador
const { crearUsuario } = require('./usuariosController'); 

async function testRegistro() {
    console.log("Iniciando prueba de registro...");
    
    try {
        // Datos del nuevo usuario
        const nombre = "Juan Pérez";
        const email = `juan.perez.${Date.now()}@inventario.com`; // Usamos timestamp para evitar duplicados
        const password = "passwordSegura123";
        const id_rol_admin = 1;

        const resultado = await crearUsuario(nombre, email, password, id_rol_admin);
        
        if (resultado.success) {
            console.log(`Registro EXITOSO. ID de usuario: ${resultado.userId}`);
        }
        
    } catch (error) {
        console.error("Fallo el registro:", error.message);
    } finally {
        // Detiene el proceso de Node después de la prueba
        process.exit(); 
    }
}

// Ejecutar la prueba
testRegistro();