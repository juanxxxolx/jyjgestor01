// backend/crud_productos/movimientosController.js

const db = require('../conexion');

/**
 * Obtiene el historial de movimientos de un producto
 */
async function obtenerHistorial(id_producto) {
    try {
        const query = `
            SELECT 
                id_movimiento, 
                id_producto, 
                tipo_movimiento, 
                cantidad, 
                motivo, 
                fecha_movimiento,
                id_usuario
            FROM movimientos
            WHERE id_producto = ?
            ORDER BY fecha_movimiento DESC
            LIMIT 100;
        `;
        
        const [rows] = await db.execute(query, [id_producto]);
        return rows;
    } catch (error) {
        console.error('Error al obtener historial:', error.message);
        throw new Error("Error al obtener historial: " + error.message);
    }
}

/**
 * Crea un nuevo movimiento de stock
 */
async function crearMovimiento(id_producto, tipo_movimiento, cantidad, motivo, id_usuario = null) {
    try {
        // Validar que el producto existe
        const [producto] = await db.execute(
            'SELECT stock FROM productos WHERE id_producto = ?',
            [id_producto]
        );
        
        if (producto.length === 0) {
            throw new Error("Producto no encontrado");
        }

        const stockActual = producto[0].stock;
        let nuevoStock = stockActual;

        // Calcular nuevo stock según el tipo de movimiento
        if (tipo_movimiento === 'ENTRADA') {
            nuevoStock = stockActual + cantidad;
        } else if (tipo_movimiento === 'SALIDA') {
            nuevoStock = stockActual - cantidad;
            if (nuevoStock < 0) {
                throw new Error("Stock insuficiente para realizar la salida");
            }
        } else if (tipo_movimiento === 'AJUSTE') {
            nuevoStock = cantidad; // Para ajustes, la cantidad es el nuevo stock
        }

        // Insertar movimiento
        const insertQuery = `
            INSERT INTO movimientos 
            (id_producto, tipo_movimiento, cantidad, motivo, fecha_movimiento, id_usuario)
            VALUES (?, ?, ?, ?, NOW(), ?);
        `;
        
        const [result] = await db.execute(insertQuery, [
            id_producto, 
            tipo_movimiento, 
            cantidad, 
            motivo,
            id_usuario
        ]);

        // Actualizar stock del producto
        const updateQuery = `
            UPDATE productos 
            SET stock = ?
            WHERE id_producto = ?;
        `;
        
        await db.execute(updateQuery, [nuevoStock, id_producto]);

        return { 
            id_movimiento: result.insertId,
            nuevoStock: nuevoStock,
            message: "Movimiento registrado con éxito"
        };
    } catch (error) {
        console.error('Error al crear movimiento:', error.message);
        throw new Error("Error al crear movimiento: " + error.message);
    }
}

/**
 * Obtiene estadísticas de movimientos
 */
async function obtenerEstadisticas(id_producto, dias = 30) {
    try {
        const query = `
            SELECT 
                tipo_movimiento,
                COUNT(*) as total_movimientos,
                SUM(cantidad) as cantidad_total,
                AVG(cantidad) as promedio_cantidad
            FROM movimientos
            WHERE id_producto = ? 
            AND fecha_movimiento >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY tipo_movimiento;
        `;
        
        const [rows] = await db.execute(query, [id_producto, dias]);
        return rows;
    } catch (error) {
        console.error('Error al obtener estadísticas:', error.message);
        throw new Error("Error al obtener estadísticas: " + error.message);
    }
}

module.exports = {
    obtenerHistorial,
    crearMovimiento,
    obtenerEstadisticas
};
