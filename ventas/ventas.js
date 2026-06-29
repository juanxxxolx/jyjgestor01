// Variables globales
let productos = [];
let numeroVenta = 1000 + Math.floor(Math.random() * 9000);

// Agregar nuevo producto
function agregarProducto() {
    const container = document.getElementById('productosContainer');
    const productRow = document.createElement('div');
    productRow.className = 'product-row';
    productRow.innerHTML = `
        <div class="product-field">
            <label>Nombre/Descripción *</label>
            <input type="text" class="product-name" placeholder="Ej: Laptop Dell XPS 13" required>
        </div>
        <div class="product-field-small">
            <label>Cantidad *</label>
            <input type="number" class="product-quantity" value="1" min="1" required>
        </div>
        <div class="product-field-small">
            <label>Precio Unitario *</label>
            <input type="number" class="product-price" placeholder="0.00" step="0.01" min="0" required>
        </div>
        <div class="product-remove">
            <button type="button" onclick="this.parentElement.parentElement.remove(); calcularTotal()">×</button>
        </div>
    `;
    container.appendChild(productRow);
}

// Calcular total
function calcularTotal() {
    const productRows = document.querySelectorAll('.product-row');
    let subtotal = 0;

    productRows.forEach(row => {
        const quantity = parseFloat(row.querySelector('.product-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.product-price').value) || 0;
        subtotal += quantity * price;
    });

    const discount = parseFloat(document.getElementById('discountInput').value) || 0;
    const tax = parseFloat(document.getElementById('taxInput').value) || 0;

    const discountAmount = subtotal * (discount / 100);
    const subtotalAfterDiscount = subtotal - discountAmount;
    const taxAmount = subtotalAfterDiscount * (tax / 100);
    const finalTotal = subtotalAfterDiscount + taxAmount;

    // Actualizar display
    document.getElementById('subtotal').textContent = '$' + subtotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    document.getElementById('discountAmount').textContent = '-$' + discountAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    document.getElementById('taxAmount').textContent = '$' + taxAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    document.getElementById('finalTotal').textContent = '$' + finalTotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Actualizar resumen de productos
    actualizarResumen();

    return { subtotal, discount, discountAmount, taxAmount, finalTotal };
}

// Actualizar resumen en tiempo real
function actualizarResumen() {
    // Datos del cliente
    document.getElementById('summaryName').textContent = document.getElementById('clientName').value || '-';
    document.getElementById('summaryPhone').textContent = document.getElementById('clientPhone').value || '-';
    document.getElementById('summaryEmail').textContent = document.getElementById('clientEmail').value || '-';
    document.getElementById('summaryDocument').textContent = document.getElementById('clientDocument').value || '-';

    // Productos
    const productRows = document.querySelectorAll('.product-row');
    const summaryProducts = document.getElementById('summaryProducts');
    summaryProducts.innerHTML = '';

    if (productRows.length === 0) {
        summaryProducts.innerHTML = '<p class="empty-message">Sin productos agregados</p>';
    } else {
        productRows.forEach(row => {
            const name = row.querySelector('.product-name').value;
            const quantity = parseFloat(row.querySelector('.product-quantity').value) || 0;
            const price = parseFloat(row.querySelector('.product-price').value) || 0;
            const total = quantity * price;

            if (name && quantity > 0 && price > 0) {
                const item = document.createElement('div');
                item.className = 'product-summary-item';
                item.innerHTML = `
                    <span>${quantity}x ${name}</span>
                    <span>$${total.toFixed(2)}</span>
                `;
                summaryProducts.appendChild(item);
            }
        });
    }

    document.getElementById('productCount').textContent = productRows.length;
}

// Limpiar formulario
function limpiarFormulario() {
    document.getElementById('clientName').value = '';
    document.getElementById('clientPhone').value = '';
    document.getElementById('clientEmail').value = '';
    document.getElementById('clientDocument').value = '';
    document.getElementById('observations').value = '';
    document.getElementById('discountInput').value = '0';
    document.getElementById('taxInput').value = '19';

    const container = document.getElementById('productosContainer');
    container.innerHTML = `
        <div class="product-row">
            <div class="product-field">
                <label>Nombre/Descripción *</label>
                <input type="text" class="product-name" placeholder="Ej: Laptop Dell XPS 13" required>
            </div>
            <div class="product-field-small">
                <label>Cantidad *</label>
                <input type="number" class="product-quantity" value="1" min="1" required>
            </div>
            <div class="product-field-small">
                <label>Precio Unitario *</label>
                <input type="number" class="product-price" placeholder="0.00" step="0.01" min="0" required>
            </div>
            <div class="product-remove">
                <button type="button" onclick="this.parentElement.parentElement.remove(); calcularTotal()">×</button>
            </div>
        </div>
    `;

    calcularTotal();
}

// Registrar venta y descargar colilla
function registrarVenta() {
    // Validar datos del cliente
    const clientName = document.getElementById('clientName').value.trim();
    if (!clientName) {
        alert('Por favor ingresa el nombre del cliente');
        return;
    }

    // Validar productos
    const productRows = document.querySelectorAll('.product-row');
    let hasValidProduct = false;

    productRows.forEach(row => {
        const name = row.querySelector('.product-name').value.trim();
        const quantity = parseFloat(row.querySelector('.product-quantity').value);
        const price = parseFloat(row.querySelector('.product-price').value);

        if (name && quantity > 0 && price > 0) {
            hasValidProduct = true;
        }
    });

    if (!hasValidProduct) {
        alert('Por favor agrega al menos un producto válido');
        return;
    }

    // Obtener totales
    const totales = calcularTotal();

    // Recopilar datos
    const ventaData = {
        numeroVenta: numeroVenta,
        fecha: new Date().toLocaleDateString('es-CO'),
        hora: new Date().toLocaleTimeString('es-CO'),
        cliente: {
            nombre: clientName,
            telefono: document.getElementById('clientPhone').value || 'N/A',
            email: document.getElementById('clientEmail').value || 'N/A',
            documento: document.getElementById('clientDocument').value || 'N/A'
        },
        productos: [],
        observaciones: document.getElementById('observations').value || 'Sin observaciones',
        totales: totales
    };

    // Recopilar productos
    productRows.forEach(row => {
        const name = row.querySelector('.product-name').value.trim();
        const quantity = parseFloat(row.querySelector('.product-quantity').value);
        const price = parseFloat(row.querySelector('.product-price').value);

        if (name && quantity > 0 && price > 0) {
            ventaData.productos.push({
                nombre: name,
                cantidad: quantity,
                precioUnitario: price,
                total: quantity * price
            });
        }
    });

    // Descargar colilla
    descargarColilla(ventaData);

    // Guardar en localStorage (para historial)
    guardarVenta(ventaData);

    // Limpiar y preparar para la siguiente venta
    numeroVenta++;
    limpiarFormulario();
    alert('¡Venta registrada exitosamente! Colilla descargada.');
}

// Descargar colilla de pago
function descargarColilla(ventaData) {
    const linea = '='.repeat(50);
    const linePunto = '-'.repeat(50);

    let contenido = `
${linea}
           COLILLA DE PAGO - COMPROBANTE DE VENTA
${linea}

Número de Venta: #${ventaData.numeroVenta}
Fecha: ${ventaData.fecha}
Hora: ${ventaData.hora}

${linePunto}
INFORMACIÓN DEL CLIENTE
${linePunto}

Nombre: ${ventaData.cliente.nombre}
Teléfono: ${ventaData.cliente.telefono}
Correo: ${ventaData.cliente.email}
Documento: ${ventaData.cliente.documento}

${linePunto}
DETALLES DE LA COMPRA
${linePunto}

`;

    ventaData.productos.forEach((producto, index) => {
        const descripcion = `${index + 1}. ${producto.nombre}`;
        const cantidad = `Cant: ${producto.cantidad}`;
        const precio = `$${producto.precioUnitario.toFixed(2)}`;
        const subtotal = `Subtotal: $${producto.total.toFixed(2)}`;

        contenido += `${descripcion}
${cantidad} x ${precio} = ${subtotal}

`;
    });

    contenido += `
${linePunto}
RESUMEN DE PAGO
${linePunto}

Subtotal:                    $${ventaData.totales.subtotal.toFixed(2)}
Descuento (${document.getElementById('discountInput').value}%):     -$${ventaData.totales.discountAmount.toFixed(2)}
Subtotal Neto:               $${(ventaData.totales.subtotal - ventaData.totales.discountAmount).toFixed(2)}
IVA (${document.getElementById('taxInput').value}%):                 +$${ventaData.totales.taxAmount.toFixed(2)}

${linea}
TOTAL A PAGAR:               $${ventaData.totales.finalTotal.toFixed(2)}
${linea}

OBSERVACIONES:
${ventaData.observaciones}

${linea}
        ¡Gracias por su compra!
          Vuelva pronto
${linea}

Impreso: ${new Date().toLocaleString('es-CO')}
`;

    // Crear y descargar archivo
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Colilla_Venta_${ventaData.numeroVenta}_${ventaData.fecha.replace(/\//g, '-')}.txt`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Guardar venta en historial (localStorage)
function guardarVenta(ventaData) {
    try {
        let historial = JSON.parse(localStorage.getItem('ventasHistorial')) || [];
        historial.push(ventaData);
        localStorage.setItem('ventasHistorial', JSON.stringify(historial));
        console.log('Venta guardada en historial');
    } catch (error) {
        console.log('No se pudo guardar en historial:', error);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Actualizar resumen cuando se escriba en los campos
    document.getElementById('clientName').addEventListener('input', actualizarResumen);
    document.getElementById('clientPhone').addEventListener('input', actualizarResumen);
    document.getElementById('clientEmail').addEventListener('input', actualizarResumen);
    document.getElementById('clientDocument').addEventListener('input', actualizarResumen);

    // Calcular total cuando cambien productos
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('product-quantity') || 
            e.target.classList.contains('product-price') ||
            e.target.classList.contains('product-name')) {
            calcularTotal();
        }
    });

    // Inicializar
    calcularTotal();
});