const TOKEN_KEY = 'token'; 
const API_URL = 'http://localhost:3000/api';
const LOGOUT_REDIRECT_URL = '../login/login.html';

// ==========================================
// FUNCIONES DE AUTENTICACIÓN
// ==========================================

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function checkAuthentication() {
    const token = localStorage.getItem(TOKEN_KEY);
    console.log('Token encontrado:', token ? 'Sí' : 'No');
    
    if (!token) {
        console.log('⚠️ No hay token, redirigiendo a login...');
        window.location.href = LOGOUT_REDIRECT_URL;
    } else {
        console.log('✅ Token válido, acceso permitido');
    }
}

// Ejecutar verificación después de un pequeño delay
setTimeout(checkAuthentication, 100);

// ==========================================
// FUNCIONES DE UTILIDAD
// ==========================================

function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-box message-${type}`;
    messageDiv.textContent = message;
    document.body.insertBefore(messageDiv, document.body.firstChild);
    
    setTimeout(() => messageDiv.remove(), 3000);
}

function formatCurrency(value) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP'
    }).format(value);
}

// ==========================================
// CRUD DE PRODUCTOS
// ==========================================

async function crearProducto(datos) {
    try {
        const response = await fetch(`${API_URL}/productos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                nombre: datos.productName,
                referencia: datos.productSKU,
                descripcion: datos.productDescription || '',
                precio_venta: parseFloat(datos.productPrice),
                stock: parseInt(datos.productStock) || 0,
                stock_minimo: parseInt(datos.productMinStock) || 5,
                id_categoria: parseInt(datos.productCategory) || 1
            })
        });

        console.log('Response status:', response.status);
        
        // Verificar que sea JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Respuesta inválida del servidor. Content-Type: ${contentType}`);
        }

        const result = await response.json();
        console.log('Response body:', result);

        if (!response.ok) {
            throw new Error(result.error || result.message || `Error HTTP ${response.status}`);
        }

        return result;
    } catch (error) {
        console.error('Error en crearProducto:', error);
        
        if (error.message.includes('Failed to fetch')) {
            console.error('❌ No se puede conectar al servidor en', API_URL);
            showMessage('No se puede conectar al servidor. ¿Está Node.js ejecutándose?', 'error');
        } else {
            showMessage(`Error: ${error.message}`, 'error');
        }
        
        throw error;
    }
}

async function listarProductos() {
    try {
        const response = await fetch(`${API_URL}/productos`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        // Verificar que sea JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Respuesta inválida del servidor. Content-Type: ${contentType}`);
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || `Error HTTP ${response.status}`);
        }

        // Si tiene estructura { success: true, data: [...] } retorna data
        return result.data || result;
    } catch (error) {
        console.error('Error al listar productos:', error);
        
        if (error.message.includes('Failed to fetch')) {
            console.error('❌ No se puede conectar al servidor en', API_URL);
            showMessage('No se puede conectar al servidor. ¿Está Node.js ejecutándose?', 'error');
        }
        
        return [];
    }
}

async function actualizarProducto(id, datos) {
    try {
        const response = await fetch(`${API_URL}/productos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                nombre: datos.productName,
                referencia: datos.productSKU,
                descripcion: datos.productDescription || '',
                precio_venta: parseFloat(datos.productPrice),
                stock_minimo: parseInt(datos.productMinStock) || 5,
                id_categoria: parseInt(datos.productCategory) || 1
            })
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Respuesta inválida del servidor. Content-Type: ${contentType}`);
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || result.message || `Error HTTP ${response.status}`);
        }

        return result;
    } catch (error) {
        console.error('Error en actualizarProducto:', error);
        showMessage(`Error: ${error.message}`, 'error');
        throw error;
    }
}

async function eliminarProducto(id) {
    try {
        const response = await fetch(`${API_URL}/productos/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Respuesta inválida del servidor. Content-Type: ${contentType}`);
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || result.message || `Error HTTP ${response.status}`);
        }

        return result;
    } catch (error) {
        console.error('Error en eliminarProducto:', error);
        showMessage(`Error: ${error.message}`, 'error');
        throw error;
    }
}

// ==========================================
// FUNCIONES DE TABLA
// ==========================================

function renderTabla(productos) {
    const tbody = document.querySelector('.data-table tbody');
    tbody.innerHTML = '';

    if (!productos || productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">No hay productos registrados</td></tr>';
        return;
    }

    productos.forEach(producto => {
        const row = document.createElement('tr');
        const stockClass = producto.stock > producto.stock_minimo ? 'stock-high' : 'stock-low';
        const statusClass = producto.stock > 0 ? 'status-active' : 'status-inactive';
        const statusText = producto.stock > 0 ? 'Activo' : 'Sin Stock';

        row.innerHTML = `
            <td>${producto.referencia || 'N/A'}</td>
            <td>${producto.nombre}</td>
            <td>${producto.nombre_categoria || 'N/A'}</td>
            <td>${formatCurrency(producto.precio_venta)}</td>
            <td class="${stockClass}">${producto.stock}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <button class="action-btn edit-btn" data-id="${producto.id_producto}" title="Editar">
                    <svg data-lucide="pencil"></svg>
                </button>
                <button class="action-btn delete-btn" data-id="${producto.id_producto}" title="Eliminar">
                    <svg data-lucide="trash-2"></svg>
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });

    // Reinicializar iconos de Lucide
    lucide.createIcons();

    // Agregar event listeners a botones de acción
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editarProducto(btn.dataset.id));
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => eliminarProductoHandler(btn.dataset.id));
    });
}

// ==========================================
// MANEJADORES DE EVENTOS
// ==========================================

async function editarProducto(id) {
    // Implementar edición (por ahora solo mostramos el modal)
    const modal = document.getElementById("productModal");
    const title = modal.querySelector('.modal-title');
    title.textContent = '📝 Editar Producto';
    modal.style.display = "block";
    // Cargar datos del producto si es necesario
}

async function eliminarProductoHandler(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        return;
    }

    try {
        await eliminarProducto(id);
        showMessage('Producto eliminado exitosamente', 'success');
        cargarProductos();
    } catch (error) {
        showMessage(error.message || 'Error al eliminar el producto', 'error');
    }
}

async function cargarProductos() {
    const productos = await listarProductos();
    renderTabla(productos);
}

// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    
    lucide.createIcons();

    // --- Variables del Modal ---
    const modal = document.getElementById("productModal");
    const addButton = document.querySelector(".add-button");
    const closeSpan = document.querySelector(".close-button");
    const cancelButton = document.querySelector(".cancel-btn");
    const productForm = document.getElementById("productForm");

    // Función para ocultar el modal
    function hideModal() {
        modal.style.display = "none";
        productForm.reset();
        modal.querySelector('.modal-title').textContent = '📝 Añadir Nuevo Producto';
    }

    // 1. Mostrar el modal al hacer clic en Añadir
    addButton.addEventListener('click', function() {
        modal.style.display = "block";
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
    
    // 5. Manejar el envío del formulario
    productForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const formData = new FormData(productForm);
        const datos = Object.fromEntries(formData);
        
        try {
            const btn = productForm.querySelector('.save-btn');
            btn.disabled = true;
            btn.textContent = 'Guardando...';

            await crearProducto(datos);
            showMessage('Producto creado exitosamente', 'success');
            
            hideModal();
            await cargarProductos();

            btn.disabled = false;
            btn.textContent = 'Guardar Producto';
        } catch (error) {
            showMessage(error.message || 'Error al guardar el producto', 'error');
            const btn = productForm.querySelector('.save-btn');
            btn.disabled = false;
            btn.textContent = 'Guardar Producto';
        }
    });

    // Cargar productos al iniciar
    cargarProductos();
});