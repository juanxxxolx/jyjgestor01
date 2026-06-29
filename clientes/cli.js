const TOKEN_KEY = 'token';

const API_URL = 'http://localhost:3000/api';

const LOGOUT_REDIRECT_URL = '../login/login.html';

// ==========================================
// TOKEN
// ==========================================

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function checkAuthentication() {

    const token = getToken();

    if (!token) {
        window.location.href = LOGOUT_REDIRECT_URL;
    }
}

setTimeout(checkAuthentication, 100);

// ==========================================
// MENSAJES
// ==========================================

function showMessage(message, type = 'success') {

    const old = document.querySelector('.message-box');

    if (old) old.remove();

    const div = document.createElement('div');

    div.className = `message-box message-${type}`;

    div.textContent = message;

    document.body.prepend(div);

    setTimeout(() => {
        div.remove();
    }, 3000);
}

// ==========================================
// CRUD
// ==========================================

async function listarClientes() {

    try {

        const response = await fetch(`${API_URL}/clientes`, {

            method: 'GET',

            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const data = await response.json();

        if (Array.isArray(data)) {
            return data;
        }

        if (data.data) {
            return data.data;
        }

        return [];

    } catch (error) {

        console.error(error);

        return [];
    }
}

async function crearCliente(datos) {

    const response = await fetch(`${API_URL}/clientes`, {

        method: 'POST',

        headers: {

            'Content-Type': 'application/json',

            'Authorization': `Bearer ${getToken()}`
        },

        body: JSON.stringify({

            nombre: datos.clientName,

            email: datos.clientEmail,

            telefono: datos.clientPhone,

            direccion: datos.clientAddress,

            tipo_cliente: datos.clientType
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    return data;
}

async function actualizarCliente(id, datos) {

    const response = await fetch(`${API_URL}/clientes/${id}`, {

        method: 'PUT',

        headers: {

            'Content-Type': 'application/json',

            'Authorization': `Bearer ${getToken()}`
        },

        body: JSON.stringify({

            nombre: datos.clientName,

            email: datos.clientEmail,

            telefono: datos.clientPhone,

            direccion: datos.clientAddress,

            tipo_cliente: datos.clientType
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    return data;
}

async function eliminarCliente(id) {

    const response = await fetch(`${API_URL}/clientes/${id}`, {

        method: 'DELETE',

        headers: {
            'Authorization': `Bearer ${getToken()}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    return data;
}

// ==========================================
// TABLA
// ==========================================

function renderTabla(clientes) {

    const tbody = document.querySelector('.data-table tbody');

    tbody.innerHTML = '';

    if (clientes.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7"
                    style="text-align:center;padding:20px;">
                    No hay clientes registrados
                </td>
            </tr>
        `;

        return;
    }

    clientes.forEach(cliente => {

        let tipoTexto = 'Minorista';

        let badgeClass = 'type-retail';

        if (cliente.tipo_cliente === 'wholesale') {

            tipoTexto = 'Mayorista';

            badgeClass = 'type-wholesale';
        }

        if (cliente.tipo_cliente === 'corp') {

            tipoTexto = 'Corporativo';

            badgeClass = 'type-corp';
        }

        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${cliente.id_cliente}</td>

            <td>${cliente.nombre}</td>

            <td>${cliente.email}</td>

            <td>${cliente.telefono}</td>

            <td>${cliente.direccion || 'Sin dirección'}</td>

            <td>
                <span class="type-badge ${badgeClass}">
                    ${tipoTexto}
                </span>
            </td>

            <td>

                <button
                    class="action-btn edit-btn"
                    data-id="${cliente.id_cliente}"
                    title="Editar">

                    <svg data-lucide="pencil"></svg>

                </button>

                <button
                    class="action-btn delete-btn"
                    data-id="${cliente.id_cliente}"
                    title="Eliminar">

                    <svg data-lucide="trash-2"></svg>

                </button>

            </td>
        `;

        tbody.appendChild(tr);
    });

    lucide.createIcons();

    // EDITAR

    document.querySelectorAll('.edit-btn').forEach(btn => {

        btn.addEventListener('click', () => {

            const id = btn.dataset.id;

            const cliente = clientes.find(c => c.id_cliente == id);

            if (!cliente) return;

            const modal = document.getElementById('clientModal');

            modal.style.display = 'block';

            document.querySelector('.modal-title').textContent =
                '✏️ Editar Cliente';

            document.getElementById('clientName').value =
                cliente.nombre;

            document.getElementById('clientEmail').value =
                cliente.email;

            document.getElementById('clientPhone').value =
                cliente.telefono;

            document.getElementById('clientAddress').value =
                cliente.direccion || '';

            document.getElementById('clientType').value =
                cliente.tipo_cliente;

            document.getElementById('clientForm').dataset.editing = id;
        });
    });

    // ELIMINAR

    document.querySelectorAll('.delete-btn').forEach(btn => {

        btn.addEventListener('click', async () => {

            const id = btn.dataset.id;

            if (!confirm('¿Eliminar cliente?')) {
                return;
            }

            try {

                await eliminarCliente(id);

                showMessage('Cliente eliminado');

                cargarClientes();

            } catch (error) {

                console.error(error);
            }
        });
    });
}

// ==========================================
// CARGAR CLIENTES
// ==========================================

async function cargarClientes() {

    const clientes = await listarClientes();

    renderTabla(clientes);
}

// ==========================================
// INICIO
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    lucide.createIcons();

    const modal = document.getElementById('clientModal');

    const addButton = document.querySelector('.add-button');

    const closeButton = document.querySelector('.close-button');

    const cancelButton = document.querySelector('.cancel-btn');

    const clientForm = document.getElementById('clientForm');

    // ABRIR

    addButton.addEventListener('click', () => {

        modal.style.display = 'block';
    });

    // CERRAR

    function cerrarModal() {

        modal.style.display = 'none';

        clientForm.reset();

        delete clientForm.dataset.editing;

        document.querySelector('.modal-title').textContent =
            '📝 Añadir Nuevo Cliente';
    }

    closeButton.addEventListener('click', cerrarModal);

    cancelButton.addEventListener('click', cerrarModal);

    window.addEventListener('click', (e) => {

        if (e.target === modal) {
            cerrarModal();
        }
    });

    // GUARDAR

    clientForm.addEventListener('submit', async (e) => {

        e.preventDefault();

        const formData = new FormData(clientForm);

        const datos = Object.fromEntries(formData);

        const editingId = clientForm.dataset.editing;

        try {

            const btn = document.querySelector('.save-btn');

            btn.disabled = true;

            btn.textContent = 'Guardando...';

            if (editingId) {

                await actualizarCliente(editingId, datos);

                showMessage('Cliente actualizado');

            } else {

                await crearCliente(datos);

                showMessage('Cliente creado');
            }

            cerrarModal();

            cargarClientes();

            btn.disabled = false;

            btn.textContent = 'Guardar Cliente';

        } catch (error) {

            console.error(error);

            showMessage(error.message, 'error');

            const btn = document.querySelector('.save-btn');

            btn.disabled = false;

            btn.textContent = 'Guardar Cliente';
        }
    });

    // BUSCADOR

    document.getElementById('searchInput')
        .addEventListener('input', async (e) => {

            const texto = e.target.value.toLowerCase();

            const clientes = await listarClientes();

            const filtrados = clientes.filter(cliente => {

                return (
                    cliente.nombre.toLowerCase().includes(texto) ||
                    cliente.email.toLowerCase().includes(texto) ||
                    cliente.telefono.toLowerCase().includes(texto)
                );
            });

            renderTabla(filtrados);
        });

    cargarClientes();
});