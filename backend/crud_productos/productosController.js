// 🚨 CORRECCIÓN CLAVE: Usamos '../conexion' para subir un nivel de carpeta
const db = require('../conexion'); 

/**
 * Agrega un nuevo producto a la tabla 'productos'.
 */
async function crearProducto(nombre, referencia, descripcion, precio_venta, stock, stock_minimo, id_categoria) {
    try {
        const query = `
            INSERT INTO productos (nombre, referencia, descripcion, precio_venta, stock, stock_minimo, id_categoria)
            VALUES (?, ?, ?, ?, ?, ?, ?);
        `;
        
        const [result] = await db.execute(query, [
            nombre, referencia, descripcion, precio_venta, stock, stock_minimo, id_categoria
        ]);

        return { id: result.insertId, message: "Producto registrado con éxito." };

    } catch (error) {
        console.error('Error al crear producto:', error.message);
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error("La referencia del producto ya existe.");
        }
        throw new Error("Error interno al registrar el producto.");
    }
}

/**
 * Lista todos los productos.
 */
async function listarProductos() {
    try {
        // Intentar con JOIN a categorias
        try {
            const query = `
                SELECT 
                    p.id_producto, p.nombre, p.referencia, p.descripcion, p.precio_venta, p.stock, p.stock_minimo, c.nombre_categoria
                FROM productos p
                LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
                ORDER BY p.nombre;
            `;
            
            const [rows] = await db.execute(query);
            return rows;
        } catch (joinError) {
            // Si el JOIN falla, listar sin categorias
            console.warn('JOIN con categorias falló, listando sin categorias');
            const query = `
                SELECT 
                    p.id_producto, p.nombre, p.referencia, p.descripcion, p.precio_venta, p.stock, p.stock_minimo, p.id_categoria
                FROM productos p
                ORDER BY p.nombre;
            `;
            
            const [rows] = await db.execute(query);
            return rows.map(p => ({
                ...p,
                nombre_categoria: 'Sin categoría'
            }));
        }
    } catch (error) {
        console.error('Error al listar productos:', error.message);
        throw new Error("Error al obtener la lista de productos.");
    }
}

/**
 * Actualiza la información de un producto existente.
 */
async function actualizarProducto(id_producto, nombre, referencia, descripcion, precio_venta, stock_minimo, id_categoria) {
    try {
        const query = `
            UPDATE productos 
            SET nombre = ?, referencia = ?, descripcion = ?, precio_venta = ?, stock_minimo = ?, id_categoria = ?
            WHERE id_producto = ?;
        `;
        
        const [result] = await db.execute(query, [
            nombre, referencia, descripcion, precio_venta, stock_minimo, id_categoria, id_producto
        ]);

        if (result.affectedRows === 0) {
            throw new Error("Producto no encontrado o sin cambios.");
        }
        return { message: "Producto actualizado con éxito." };

    } catch (error) {
        console.error('Error al actualizar producto:', error.message);
        throw new Error("Error interno al actualizar el producto.");
    }
}


/**
 * Elimina un producto de la base de datos por su ID.
 */
async function eliminarProducto(id_producto) {
    try {
        const query = `
            DELETE FROM productos 
            WHERE id_producto = ?;
        `;
        
        const [result] = await db.execute(query, [id_producto]);

        if (result.affectedRows === 0) {
            throw new Error("Producto no encontrado.");
        }
        return { message: "Producto eliminado con éxito." };

    } catch (error) {
        console.error('Error al eliminar producto:', error.message);
        throw new Error("Error interno al eliminar el producto.");
    }
}

module.exports = {
    crearProducto,
    listarProductos,
    actualizarProducto, 
    eliminarProducto    
};