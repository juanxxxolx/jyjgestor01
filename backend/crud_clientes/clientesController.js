// backend/crud_clientes/clientesController.js

const db = require('../conexion');

/**
 * Crea un nuevo cliente
 */
async function crearCliente(nombre, email, telefono, direccion, tipo_cliente, id_usuario = null) {
    try {
        const query = `
            INSERT INTO clientes (nombre, email, telefono, direccion, tipo_cliente, id_usuario)
            VALUES (?, ?, ?, ?, ?, ?);
        `;
        
        const [result] = await db.execute(query, [
            nombre, email, telefono, direccion, tipo_cliente, id_usuario
        ]);

        return { 
            id_cliente: result.insertId, 
            message: "Cliente registrado con éxito." 
        };

    } catch (error) {
        console.error('❌ Error al crear cliente:', error.message);
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error("El email del cliente ya existe.");
        }
        throw new Error("Error interno al registrar el cliente.");
    }
}

/**
 * Lista todos los clientes
 */
async function listarClientes() {
    try {
        const query = `
            SELECT 
                id_cliente, 
                nombre, 
                email, 
                telefono, 
                direccion, 
                tipo_cliente,
                fecha_registro,
                ultimo_pedido
            FROM clientes
            ORDER BY nombre;
        `;
        
        const [rows] = await db.execute(query);
        return rows;

    } catch (error) {
        console.error('❌ Error al listar clientes:', error.message);
        throw new Error("Error al obtener la lista de clientes.");
    }
}

/**
 * Obtiene un cliente por ID
 */
async function obtenerCliente(id_cliente) {
    try {
        const query = `
            SELECT 
                id_cliente, 
                nombre, 
                email, 
                telefono, 
                direccion, 
                tipo_cliente,
                fecha_registro,
                ultimo_pedido
            FROM clientes
            WHERE id_cliente = ?;
        `;
        
        const [rows] = await db.execute(query, [id_cliente]);
        
        if (rows.length === 0) {
            throw new Error("Cliente no encontrado.");
        }
        
        return rows[0];

    } catch (error) {
        console.error('❌ Error al obtener cliente:', error.message);
        throw new Error("Error al obtener el cliente.");
    }
}

/**
 * Actualiza un cliente existente
 */
async function actualizarCliente(id_cliente, nombre, email, telefono, direccion, tipo_cliente) {
    try {
        const query = `
            UPDATE clientes 
            SET nombre = ?, email = ?, telefono = ?, direccion = ?, tipo_cliente = ?
            WHERE id_cliente = ?;
        `;
        
        const [result] = await db.execute(query, [
            nombre, email, telefono, direccion, tipo_cliente, id_cliente
        ]);

        if (result.affectedRows === 0) {
            throw new Error("Cliente no encontrado o sin cambios.");
        }
        
        return { message: "Cliente actualizado con éxito." };

    } catch (error) {
        console.error('❌ Error al actualizar cliente:', error.message);
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error("El email ya está en uso por otro cliente.");
        }
        throw new Error("Error interno al actualizar el cliente.");
    }
}

/**
 * Elimina un cliente
 */
async function eliminarCliente(id_cliente) {
    try {
        const query = `
            DELETE FROM clientes 
            WHERE id_cliente = ?;
        `;
        
        const [result] = await db.execute(query, [id_cliente]);

        if (result.affectedRows === 0) {
            throw new Error("Cliente no encontrado.");
        }
        
        return { message: "Cliente eliminado con éxito." };

    } catch (error) {
        console.error('❌ Error al eliminar cliente:', error.message);
        throw new Error("Error interno al eliminar el cliente.");
    }
}

/**
 * Busca clientes por nombre, email o teléfono
 */
async function buscarClientes(termino) {
    try {
        const query = `
            SELECT 
                id_cliente, 
                nombre, 
                email, 
                telefono, 
                direccion, 
                tipo_cliente,
                fecha_registro,
                ultimo_pedido
            FROM clientes
            WHERE nombre LIKE ? 
            OR email LIKE ? 
            OR telefono LIKE ?
            ORDER BY nombre;
        `;
        
        const searchTerm = `%${termino}%`;
        const [rows] = await db.execute(query, [searchTerm, searchTerm, searchTerm]);
        
        return rows;

    } catch (error) {
        console.error('❌ Error al buscar clientes:', error.message);
        throw new Error("Error al buscar clientes.");
    }
}

module.exports = {
    crearCliente,
    listarClientes,
    obtenerCliente,
    actualizarCliente,
    eliminarCliente,
    buscarClientes
};
