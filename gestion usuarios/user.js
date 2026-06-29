const TOKEN_KEY = 'authToken'; 
const USER_KEY = 'user';       
const LOGOUT_REDIRECT_URL = '../login/login.html'; // Ajusta la ruta si es necesario

// Función para verificar si el usuario tiene un token válido
function checkAuthentication() {
    // 1. Intenta leer el token
    const token = localStorage.getItem(TOKEN_KEY); 

    // 2. Si NO hay token, redirige
    if (!token) {
        // Redirige a la página de inicio de sesión
        window.location.href = LOGOUT_REDIRECT_URL;
    }
}

// 3. Ejecutar la verificación inmediatamente al cargar el script
checkAuthentication();

document.addEventListener('DOMContentLoaded', function() {
    
    // Inicializa los iconos SVG de Lucide
    lucide.createIcons(); 

    // --- Variables del Modal ---
    const modal = document.getElementById("userModal");
    const addButton = document.querySelector(".add-button");
    const closeSpan = document.querySelector(".close-button");
    const cancelButton = document.querySelector(".cancel-btn");
    const userForm = document.getElementById("userForm");

    // Función para ocultar el modal
    function hideModal() {
        modal.style.display = "none";
        userForm.reset(); // Limpiar el formulario
        // Nota: En una app real, también limpiarías los campos de ID y cambiarías el título a "Añadir"
    }

    // 1. Mostrar el modal al hacer clic en Añadir
    addButton.addEventListener('click', function() {
        modal.style.display = "block";
        // Aquí podrías cambiar el título a "Añadir Nuevo Usuario"
        document.querySelector('.modal-title').textContent = '📝 Añadir Nuevo Usuario';
    });

    // 2. Ocultar el modal al hacer clic en (x)
    closeSpan.addEventListener('click', hideModal);
    
    // 3. Ocultar el modal al hacer clic en Cancelar
    cancelButton.addEventListener('click', hideModal);

    // 4. Ocultar el modal al hacer clic fuera de él
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            hideModal();
        }
    });
    
    // 5. Manejar el envío del formulario (Lógica simulada)
    userForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // --- Lógica de Recolección de Datos ---
        const formData = new FormData(userForm);
        const data = Object.fromEntries(formData);
        
        console.log("Datos del usuario:", data);
        alert(`Usuario: ${data.userName} (${data.userRole}) guardado (simulado).`);

        // Aquí iría la llamada a la API/Servidor (fetch/axios)

        hideModal(); // Cerrar modal
    });

    // Opcional: Agregar lógica para el botón Editar de la tabla (simulación)
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            // En una aplicación real, usarías el ID de la fila para cargar datos.
            document.querySelector('.modal-title').textContent = '✏️ Editar Usuario';
            // Simular carga de datos para edición:
            document.getElementById('userName').value = 'Laura P. Ramírez';
            document.getElementById('userEmail').value = 'laura.r@jygestor.com';
            document.getElementById('userRole').value = 'ventas';
            document.getElementById('userStatus').value = 'active';

            modal.style.display = 'block';
        });
    });

});