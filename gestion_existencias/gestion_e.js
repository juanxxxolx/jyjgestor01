/**
 * Gestión de Existencias - Frontend Logic
 * Conecta con el backend para gestionar inventario y movimientos de stock
 */

// ===== CONFIGURACIÓN BASE =====
const API_BASE_URL = 'http://localhost:3000/api';
let inventoryData = [];
let isLoading = false;

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Gestión de Existencias Inicializado');
    console.log('📡 API URL:', API_BASE_URL);
    
    // Verificar autenticación
    const token = localStorage.getItem('token');
    if (!token) {
        console.warn('⚠️ No hay token de autenticación');
        showNotification('Por favor inicia sesión primero', 'error');
        redirectToLogin();
        return;
    }
    
    // Inicializar Lucide icons
    if (window.lucide) {
        lucide.createIcons();
    }
    
    // Cargar datos del inventario
    loadInventoryData();
    
    // Eventos del Modal
    setupModalEvents();
    
    // Evento del botón Registrar Movimiento
    document.getElementById('open-general-mov-btn')?.addEventListener('click', openStockModal);
    
    // Evento de búsqueda
    document.getElementById('search-input')?.addEventListener('keyup', filterInventory);
    
    // Recargar cada 30 segundos
    setInterval(loadInventoryData, 30000);
});

// ===== CARGAR DATOS DEL INVENTARIO =====
async function loadInventoryData() {
    if (isLoading) return;
    isLoading = true;
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('No estás autenticado', 'error');
            redirectToLogin();
            isLoading = false;
            return;
        }

        console.log('📥 Cargando inventario...');
        const response = await fetch(`${API_BASE_URL}/productos`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('📊 Response status:', response.status);
        console.log('📊 Content-Type:', response.headers.get('content-type'));
        
        if (!response.ok) {
            if (response.status === 401) {
                showNotification('Sesión expirada', 'error');
                redirectToLogin();
                isLoading = false;
                return;
            }
            throw new Error(`HTTP ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('❌ Content-Type inválido:', contentType);
            throw new Error(`Content-Type inválido: ${contentType}. El servidor debe devolver application/json`);
        }
        
        const data = await response.json();
        console.log('📥 Datos recibidos:', data);
        
        if (!data.data || !Array.isArray(data.data)) {
            throw new Error('Formato de datos inválido: esperado { data: [...] }');
        }
        
        inventoryData = data.data;
        console.log(`✅ ${inventoryData.length} productos cargados`);
        renderInventoryTable();
        
    } catch (error) {
        console.error('❌ Error:', error);
        
        if (error.message.includes('Failed to fetch')) {
            showNotification('No se puede conectar al servidor en http://localhost:3000\\n¿Está ejecutándose Node.js?', 'error');
        } else if (error.message.includes('Content-Type')) {
            showNotification('Error: El servidor no devuelve JSON válido\\n' + error.message, 'error');
        } else {
            showNotification(`Error: ${error.message}`, 'error');
        }
        renderEmptyState();
        
    } finally {
        isLoading = false;
    }
}

// ===== RENDERIZAR TABLA DE INVENTARIO =====
function renderInventoryTable() {
    const tbody = document.getElementById('inventory-table-body');
    
    if (!inventoryData || inventoryData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 40px;">No hay productos en el inventario</td></tr>';
        updateFooterCount(0, 0);
        return;
    }
    
    tbody.innerHTML = inventoryData.map(product => {
        const stockStatus = getStockStatus(product.stock, product.stock_minimo);
        const alertStatus = product.stock <= product.stock_minimo ? 'alert-low' : 'alert-none';
        const alertText = product.stock <= product.stock_minimo ? '⚠️ BAJO' : '✓ Normal';
        
        return `
            <tr class="${product.stock <= product.stock_minimo ? 'highlight-row' : ''}">
                <td><strong>${product.referencia || 'N/A'}</strong></td>
                <td>${product.nombre}</td>
                <td>${product.nombre_categoria || 'Sin categoría'}</td>
                <td class="${stockStatus.class}">${product.stock}</td>
                <td>${product.stock_minimo}</td>
                <td><span class="${alertStatus}">${alertText}</span></td>
                <td>
                    <small>${product.ultimo_movimiento ? formatDate(product.ultimo_movimiento) : 'N/A'}</small>
                </td>
                <td>
                    <button class="action-btn adjust-btn" title="Ajustar Stock" onclick="openStockModalForProduct(${product.id_producto})">
                        <svg data-lucide="edit-3" class="icon-small"></svg>
                    </button>
                    <button class="action-btn view-btn" title="Ver Historial" onclick="viewStockHistory(${product.id_producto})">
                        <svg data-lucide="history" class="icon-small"></svg>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    updateFooterCount(inventoryData.length, inventoryData.length);
    
    // Re-inicializar Lucide icons para los nuevos elementos
    if (window.lucide) {
        lucide.createIcons();
    }
}

// ===== FILTRO DE BÚSQUEDA =====
function filterInventory() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    const filtered = inventoryData.filter(product => 
        product.nombre.toLowerCase().includes(searchTerm) ||
        product.referencia.toLowerCase().includes(searchTerm) ||
        (product.nombre_categoria || '').toLowerCase().includes(searchTerm)
    );
    
    const tbody = document.getElementById('inventory-table-body');
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 20px;">No se encontraron productos</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(product => {
        const stockStatus = getStockStatus(product.stock, product.stock_minimo);
        const alertStatus = product.stock <= product.stock_minimo ? 'alert-low' : 'alert-none';
        const alertText = product.stock <= product.stock_minimo ? '⚠️ BAJO' : '✓ Normal';
        
        return `
            <tr class="${product.stock <= product.stock_minimo ? 'highlight-row' : ''}">
                <td><strong>${product.referencia || 'N/A'}</strong></td>
                <td>${product.nombre}</td>
                <td>${product.nombre_categoria || 'Sin categoría'}</td>
                <td class="${stockStatus.class}">${product.stock}</td>
                <td>${product.stock_minimo}</td>
                <td><span class="${alertStatus}">${alertText}</span></td>
                <td>
                    <small>${product.ultimo_movimiento ? formatDate(product.ultimo_movimiento) : 'N/A'}</small>
                </td>
                <td>
                    <button class="action-btn adjust-btn" title="Ajustar Stock" onclick="openStockModalForProduct(${product.id_producto})">
                        <svg data-lucide="edit-3" class="icon-small"></svg>
                    </button>
                    <button class="action-btn view-btn" title="Ver Historial" onclick="viewStockHistory(${product.id_producto})">
                        <svg data-lucide="history" class="icon-small"></svg>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    if (window.lucide) {
        lucide.createIcons();
    }
}

// ===== MODAL DE STOCK =====
function setupModalEvents() {
    const modal = document.getElementById('stockModal');
    const closeBtn = document.getElementById('modal-close-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');
    const form = document.getElementById('stockForm');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeStockModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeStockModal);
    }
    
    if (form) {
        form.addEventListener('submit', handleStockSubmit);
    }
    
    // Cerrar modal al hacer click fuera
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeStockModal();
        }
    });
    
    // Cerrar con ESC
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('show')) {
            closeStockModal();
        }
    });
}

function openStockModal() {
    const modal = document.getElementById('stockModal');
    modal.classList.add('show');
    populateProductSelect();
    resetStockForm();
}

function openStockModalForProduct(productId) {
    const product = inventoryData.find(p => p.id_producto === productId);
    if (!product) return;
    
    const modal = document.getElementById('stockModal');
    modal.classList.add('show');
    
    document.getElementById('stockProductId').value = product.id_producto;
    document.getElementById('stockProductSelect').value = product.id_producto;
    document.getElementById('stockCurrent').value = product.stock;
    
    populateProductSelect();
}

function closeStockModal() {
    const modal = document.getElementById('stockModal');
    modal.classList.remove('show');
    resetStockForm();
}

function resetStockForm() {
    const form = document.getElementById('stockForm');
    form.reset();
    document.getElementById('stockCurrent').value = '0';
}

function populateProductSelect() {
    const select = document.getElementById('stockProductSelect');
    select.innerHTML = '<option value="">Seleccione un producto...</option>';
    
    inventoryData.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id_producto;
        option.textContent = `${product.nombre} (${product.referencia}) - Stock: ${product.stock}`;
        select.appendChild(option);
    });
    
    // Evento para actualizar stock actual
    select.addEventListener('change', (e) => {
        const selectedId = parseInt(e.target.value);
        const product = inventoryData.find(p => p.id_producto === selectedId);
        if (product) {
            document.getElementById('stockCurrent').value = product.stock;
        } else {
            document.getElementById('stockCurrent').value = '0';
        }
    });
}

// ===== ENVIAR MOVIMIENTO DE STOCK =====
async function handleStockSubmit(e) {
    e.preventDefault();
    
    const productId = parseInt(document.getElementById('stockProductSelect').value);
    const movementType = document.getElementById('stockMovementType').value;
    const quantity = parseFloat(document.getElementById('stockQuantity').value);
    const reason = document.getElementById('stockReason').value.trim();
    
    // Validar datos
    if (!productId || !movementType || !quantity || quantity <= 0) {
        showNotification('⚠️ Completa todos los campos', 'error');
        return;
    }
    
    if (reason.length < 3) {
        showNotification('⚠️ El motivo debe tener al menos 3 caracteres', 'error');
        return;
    }
    
    const product = inventoryData.find(p => p.id_producto === productId);
    if (!product) {
        showNotification('❌ Producto no encontrado', 'error');
        return;
    }
    
    // Validar stock para salidas
    if (movementType === 'SALIDA' && quantity > product.stock) {
        showNotification(`❌ Stock insuficiente. Disponible: ${product.stock}`, 'error');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('No estás autenticado', 'error');
            redirectToLogin();
            return;
        }

        console.log('📤 Enviando movimiento:', { productId, movementType, quantity });
        
        const response = await fetch(`${API_BASE_URL}/movimientos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                id_producto: productId,
                tipo_movimiento: movementType,
                cantidad: quantity,
                motivo: reason
            })
        });
        
        console.log('📊 Response status:', response.status);
        console.log('📊 Content-Type:', response.headers.get('content-type'));
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('❌ Content-Type inválido:', contentType);
            throw new Error(`Content-Type inválido: ${contentType}. El servidor debe devolver application/json`);
        }
        
        const data = await response.json();
        console.log('📤 Respuesta:', data);
        
        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
        }
        
        showNotification('✅ Movimiento registrado correctamente', 'success');
        closeStockModal();
        loadInventoryData();
        
    } catch (error) {
        console.error('❌ Error al enviar movimiento:', error);
        showNotification(`Error: ${error.message}`, 'error');
    }
}

// ===== VER HISTORIAL DE STOCK =====
async function viewStockHistory(productId) {
    const product = inventoryData.find(p => p.id_producto === productId);
    if (!product) {
        showNotification('❌ Producto no encontrado', 'error');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('No estás autenticado', 'error');
            redirectToLogin();
            return;
        }

        console.log('📊 Cargando historial del producto:', product.nombre);
        
        const response = await fetch(`${API_BASE_URL}/movimientos/${productId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('📊 Response status:', response.status);
        console.log('📊 Content-Type:', response.headers.get('content-type'));
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('❌ Content-Type inválido:', contentType);
            throw new Error(`Content-Type inválido: ${contentType}`);
        }
        
        const data = await response.json();
        console.log('📊 Datos recibidos:', data);
        
        if (!data.movimientos || !Array.isArray(data.movimientos)) {
            throw new Error('Formato de datos inválido: esperado { movimientos: [...] }');
        }
        
        const movements = data.movimientos;
        console.log(`✅ ${movements.length} movimientos cargados`);
        showHistoryModal(product.nombre, movements);
        
    } catch (error) {
        console.error('❌ Error al cargar historial:', error);
        showNotification(`Error: ${error.message}`, 'error');
    }
}

function showHistoryModal(productName, movements) {
    const historyContent = movements.length > 0 
        ? `
            <div style="max-height: 400px; overflow-y: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: var(--color-header-bg);">
                            <th style="padding: 10px; text-align: left; color: var(--color-neon-blue);">Fecha</th>
                            <th style="padding: 10px; text-align: left; color: var(--color-neon-blue);">Tipo</th>
                            <th style="padding: 10px; text-align: left; color: var(--color-neon-blue);">Cantidad</th>
                            <th style="padding: 10px; text-align: left; color: var(--color-neon-blue);">Motivo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${movements.map(mov => `
                            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                                <td style="padding: 10px;">${formatDate(mov.fecha_movimiento)}</td>
                                <td style="padding: 10px;">
                                    <span style="color: ${mov.tipo_movimiento === 'ENTRADA' ? 'var(--color-ok)' : 'var(--color-low)'}; font-weight: 600;">
                                        ${mov.tipo_movimiento}
                                    </span>
                                </td>
                                <td style="padding: 10px; font-weight: 600;">${mov.cantidad}</td>
                                <td style="padding: 10px;">${mov.motivo}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `
        : '<p style="text-align: center; padding: 20px;">No hay movimientos registrados</p>';
    
    alert(`\n📦 Historial de: ${productName}\n\n${movements.map(m => `${formatDate(m.fecha_movimiento)} - ${m.tipo_movimiento}: ${m.cantidad} (${m.motivo})`).join('\n')}`);
}

// ===== UTILIDADES =====
function getStockStatus(stock, minStock) {
    if (stock > minStock) {
        return { class: 'stock-ok', text: '✓ Suficiente' };
    } else if (stock > 0) {
        return { class: 'stock-low', text: '⚠️ Bajo' };
    } else {
        return { class: 'stock-low', text: '🚨 Agotado' };
    }
}

function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

function updateFooterCount(current, total) {
    const footer = document.getElementById('inventory-count-footer');
    if (footer) {
        footer.textContent = `Mostrando ${current} de ${total} Productos en Inventario`;
    }
}

function renderEmptyState() {
    const tbody = document.getElementById('inventory-table-body');
    tbody.innerHTML = `
        <tr>
            <td colspan="8" style="text-align: center; padding: 40px; color: var(--color-text-sub);">
                <p>📦 No hay datos disponibles</p>
                <small>Intenta cargar productos primero</small>
            </td>
        </tr>
    `;
}

function redirectToLogin() {
    setTimeout(() => {
        window.location.href = '../login/login.html';
    }, 1500);
}

function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background-color: ${type === 'success' ? 'var(--color-ok)' : type === 'error' ? 'var(--color-low)' : 'var(--color-history)'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 2000;
        font-weight: 600;
        animation: slideInRight 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
