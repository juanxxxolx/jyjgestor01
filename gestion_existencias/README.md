# 📦 Gestión de Existencias - Documentación

## 📋 Descripción General
Este módulo gestiona el inventario de productos, incluyendo:
- ✅ Visualización de stock en tiempo real
- ✅ Registro de movimientos (entrada/salida/ajuste)
- ✅ Búsqueda y filtrado de productos
- ✅ Historial de movimientos
- ✅ Alertas de stock bajo

## 🎨 Cambios de Diseño Realizados

### CSS Mejorado (gestion.css)
1. **Animaciones Avanzadas**
   - Fade-in al cargar modal
   - Slide-up para contenido
   - Pulse animation para alertas críticas
   - Transiciones suaves en inputs

2. **Interfaz Visual Mejorada**
   - Bordes con efecto neón cyan
   - Sombras mejoradas con brillo cyan
   - Texto con text-shadow para mejor contraste
   - Botones con gradientes

3. **Formularios Interactivos**
   - Focus states con brillo cyan
   - Inputs readonly con estilo distintivo
   - Textarea con altura mínima configurada
   - Validación visual

4. **Responsive Design**
   - Desktop: Optimizado para 1920px
   - Tablet: Ajustes para 768px
   - Mobile: Interfaz completa en 480px

## 🔌 Conexión con Backend

### Archivos de Configuración Requeridos

Tu backend debe exponer los siguientes endpoints:

#### 1. **GET /api/productos/listar**
Obtiene todos los productos del inventario

**Respuesta esperada:**
```json
{
  "productos": [
    {
      "id_producto": 1,
      "nombre": "Laptop",
      "referencia": "LAP-001",
      "descripcion": "Laptop Dell",
      "precio_venta": 1200,
      "stock": 5,
      "stock_minimo": 2,
      "nombre_categoria": "Electrónica",
      "ultimo_movimiento": "2025-11-25T10:30:00Z"
    }
  ]
}
```

#### 2. **POST /api/movimientos/crear**
Registra un nuevo movimiento de stock

**Body:**
```json
{
  "id_producto": 1,
  "tipo_movimiento": "ENTRADA",
  "cantidad": 5,
  "motivo": "Compra a proveedor",
  "fecha_movimiento": "2025-11-25T10:30:00Z"
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Movimiento registrado",
  "id_movimiento": 123
}
```

#### 3. **GET /api/movimientos/historial/:id_producto**
Obtiene el historial de movimientos de un producto

**Respuesta esperada:**
```json
{
  "movimientos": [
    {
      "id_movimiento": 1,
      "tipo_movimiento": "ENTRADA",
      "cantidad": 5,
      "motivo": "Compra inicial",
      "fecha_movimiento": "2025-11-20T09:00:00Z"
    }
  ]
}
```

### 🛠️ Implementar Endpoints en Backend

#### Node.js/Express Ejemplo:

```javascript
// backend/movimientosController.js

const db = require('../conexion');

// Listar movimientos de un producto
async function obtenerHistorial(id_producto) {
    try {
        const query = `
            SELECT * FROM movimientos_stock
            WHERE id_producto = ?
            ORDER BY fecha_movimiento DESC;
        `;
        
        const [rows] = await db.execute(query, [id_producto]);
        return rows;
    } catch (error) {
        throw new Error("Error al obtener historial: " + error.message);
    }
}

// Crear movimiento
async function crearMovimiento(id_producto, tipo_movimiento, cantidad, motivo) {
    try {
        const query = `
            INSERT INTO movimientos_stock (id_producto, tipo_movimiento, cantidad, motivo, fecha_movimiento)
            VALUES (?, ?, ?, ?, NOW());
        `;
        
        const [result] = await db.execute(query, [
            id_producto, tipo_movimiento, cantidad, motivo
        ]);
        
        // Actualizar stock del producto
        const updateQuery = `
            UPDATE productos 
            SET stock = stock ${tipo_movimiento === 'ENTRADA' ? '+' : '-'} ?
            WHERE id_producto = ?;
        `;
        
        await db.execute(updateQuery, [cantidad, id_producto]);
        
        return { id_movimiento: result.insertId };
    } catch (error) {
        throw new Error("Error al crear movimiento: " + error.message);
    }
}

module.exports = { obtenerHistorial, crearMovimiento };
```

#### Rutas en server.js:

```javascript
const express = require('express');
const { obtenerHistorial, crearMovimiento } = require('./backend/movimientosController');
const { listarProductos } = require('./backend/crud_productos/productosController');

const app = express();

// Middleware de autenticación
const authMiddleware = require('./backend/authMiddleware');

// Rutas
app.get('/api/productos/listar', authMiddleware, async (req, res) => {
    try {
        const productos = await listarProductos();
        res.json({ productos });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/movimientos/crear', authMiddleware, async (req, res) => {
    const { id_producto, tipo_movimiento, cantidad, motivo } = req.body;
    
    try {
        const result = await crearMovimiento(id_producto, tipo_movimiento, cantidad, motivo);
        res.json({ success: true, message: "Movimiento registrado", ...result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/movimientos/historial/:id_producto', authMiddleware, async (req, res) => {
    try {
        const movimientos = await obtenerHistorial(req.params.id_producto);
        res.json({ movimientos });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

## 📊 Estructura de Base de Datos Requerida

```sql
-- Tabla de movimientos de stock
CREATE TABLE movimientos_stock (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    tipo_movimiento ENUM('ENTRADA', 'SALIDA', 'AJUSTE') NOT NULL,
    cantidad DECIMAL(10, 2) NOT NULL,
    motivo VARCHAR(255),
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- Actualizar tabla productos (si no tienen estos campos)
ALTER TABLE productos ADD COLUMN stock_minimo INT DEFAULT 5;
ALTER TABLE productos ADD COLUMN ultimo_movimiento TIMESTAMP;
```

## 🚀 Uso del Módulo

### 1. **Cargar Inventario**
Se ejecuta automáticamente al abrir la página

### 2. **Buscar Productos**
Usa la barra de búsqueda para filtrar por:
- Nombre del producto
- SKU/Referencia
- Categoría

### 3. **Registrar Movimiento**
1. Click en "Registrar Movimiento General" O
2. Click en el botón editar de un producto
3. Completa el formulario
4. Click en "Aplicar Movimiento"

### 4. **Ver Historial**
Click en el botón de historial de un producto

## ⚙️ Configuración

### URL del API
Modifica en `gestion_e.js` línea 6:
```javascript
const API_BASE_URL = '/api'; // Cambiar según tu servidor
```

### Token de Autenticación
El sistema usa JWT token desde localStorage:
```javascript
localStorage.getItem('token')
```

## 🎯 Estados de Stock

| Estado | Color | Significado |
|--------|-------|------------|
| **Suficiente** | Verde | Stock > Stock Mínimo |
| **Bajo** | Amarillo | Stock = Stock Mínimo |
| **Crítico** | Rojo | Stock < Stock Mínimo |
| **Agotado** | Rojo | Stock = 0 |

## 🔔 Notificaciones

El sistema muestra notificaciones toast en:
- ✅ Movimiento exitoso
- ❌ Error en la operación
- ℹ️ Información general

## 📱 Responsive Breakpoints

- **Desktop**: 1024px+
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px

## 🐛 Troubleshooting

### Error: "No se pueden cargar productos"
- Verifica que el token sea válido
- Comprueba que el endpoint `/api/productos/listar` existe
- Revisa la consola del navegador (F12)

### Modal no se abre
- Asegúrate de que Lucide icons esté cargado
- Verifica que no haya errores en la consola

### Stock no se actualiza
- Verifica que el backend procese correctamente el movimiento
- Comprueba que la tabla `movimientos_stock` exista

## 📞 Soporte
Para más información, revisa los comentarios en el código.
