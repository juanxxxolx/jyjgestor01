/**
 * ========================================================
 * CONFIGURACIÓN DE CONEXIÓN A DATABASE
 * ========================================================
 * Usa pool de conexiones para mejor rendimiento
 */

require('dotenv').config();
const mysql = require('mysql2');
const config = require('./config');

// Crear pool de conexiones
const pool = mysql.createPool({
    host: config.DB.HOST,
    user: config.DB.USER,
    password: config.DB.PASSWORD,
    database: config.DB.NAME,
    waitForConnections: true,
    connectionLimit: config.DB.POOL_LIMIT,
    queueLimit: config.DB.QUEUE_LIMIT
});

// Convertir a promesas para usar async/await
const promisePool = pool.promise();

// Validar conexión
promisePool.query('SELECT 1')
    .then(() => {
        console.log(`✅ Conexión a MySQL configurada: ${config.DB.NAME}`);
    })
    .catch((err) => {
        console.error('❌ Error al conectar a MySQL:', err.message);
        process.exit(1);
    });

// Manejo de errores de conexión
pool.on('error', (err) => {
    console.error('❌ Error en pool de conexiones:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('Database connection was closed.');
    }
    if (err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') {
        console.error('Database connection was closed.');
    }
});

module.exports = promisePool;