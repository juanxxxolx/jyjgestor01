const express = require('express');
const cors = require('cors');
require('dotenv').config();
const config = require('./backend/config');
const app = express();
const router = express.Router();

const { crearUsuario, loginUsuario } = require('./backend/usuariosController');
const { authenticateToken, authorizeRoles } = require('./backend/authMiddleware');
const { crearProducto, listarProductos, actualizarProducto, eliminarProducto } = require('./backend/crud_productos/productosController');
const { obtenerHistorial, crearMovimiento, obtenerEstadisticas } = require('./backend/crud_productos/movimientosController');
const { crearCliente, listarClientes, obtenerCliente, actualizarCliente, eliminarCliente, buscarClientes } = require('./backend/crud_clientes/clientesController');

const db = require('./backend/conexion');
const nodemailer = require('nodemailer');// Inicializa la conexión




const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || config.CORS.ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS no permitido para este origen'));
        }
    },
    credentials: config.CORS.CREDENTIALS,
    methods: config.CORS.METHODS,
    allowedHeaders: config.CORS.HEADERS,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Limita tamaño de payload

// Middleware de logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Montar el router
app.use('/api', router);

// ---------------------------
// 3. AUTENTICACIÓN (PÚBLICAS)
// ---------------------------

router.post('/usuarios/registro', async (req, res) => {
    const { nombre, email, password, id_rol } = req.body;

    try {
        const resultado = await crearUsuario(nombre, email, password, id_rol);

        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            {
                id: resultado.userId,
                email,
                nombre,
                rol: id_rol || 2
            },
            process.env.JWT_SECRET || 'cambiar_esta_clave_secreta_en_produccion',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: "Usuario registrado con éxito",
            userId: resultado.userId,
            token,
            user: {
                id: resultado.userId,
                nombre,
                email,
                rol: id_rol || 2
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.post('/usuarios/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const resultado = await loginUsuario(email, password);
        res.status(200).json({ success: true, ...resultado });
    } catch {
        res.status(401).json({ success: false, error: "Email o contraseña incorrectos." });
    }
});

router.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const resultado = await loginUsuario(email, password);
        res.status(200).json({ success: true, ...resultado });
    } catch {
        res.status(401).json({ success: false, error: "Email o contraseña incorrectos." });
    }
});

router.post('/auth/register', async (req, res) => {
    const { nombre, email, contraseña } = req.body;

    try {
        const resultado = await crearUsuario(nombre, email, contraseña);
        res.status(201).json({ success: true, message: "Usuario registrado con éxito", userId: resultado.userId });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.post('/auth/forgot-password', async (req, res) => {

    const { email } = req.body;

    try {

        const [usuarios] = await db.query(
            'SELECT id_usuario, nombre, email FROM usuarios WHERE email = ?',
            [email]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'El correo no está registrado'
            });
        }

        res.status(200).json({
            success: true,
            message: `Usuario encontrado: ${usuarios[0].nombre}`
        });

    } catch (error) {

        console.error('Error forgot-password:', error);

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}); 

// ---------------------------
// 4. PRODUCTOS (PROTEGIDAS)
// ---------------------------

router.post('/productos', authenticateToken, async (req, res) => {
    const { nombre, referencia, descripcion, precio_venta, stock, stock_minimo, id_categoria } = req.body;

    if (!nombre || !referencia || !precio_venta) {
        return res.status(400).json({
            success: false,
            error: "Nombre, referencia y precio_venta son requeridos"
        });
    }

    try {
        const resultado = await crearProducto(
            nombre,
            referencia,
            descripcion,
            precio_venta,
            stock || 0,
            stock_minimo || 5,
            id_categoria || null
        );

        res.status(201).json({
            success: true,
            message: "Producto registrado con éxito",
            id: resultado.id
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.get('/productos', authenticateToken, async (req, res) => {
    try {
        const productos = await listarProductos();
        res.status(200).json({ success: true, data: productos });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.put('/productos/:id', authenticateToken, async (req, res) => {
    const id_producto = req.params.id;
    const { nombre, referencia, descripcion, precio_venta, stock_minimo, id_categoria } = req.body;

    try {
        await actualizarProducto(id_producto, nombre, referencia, descripcion, precio_venta, stock_minimo, id_categoria);
        res.status(200).json({ success: true, message: "Producto actualizado con éxito" });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.delete('/productos/:id', authenticateToken, async (req, res) => {
    const id_producto = req.params.id;

    try {
        await eliminarProducto(id_producto);
        res.status(200).json({ success: true, message: "Producto eliminado con éxito" });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// ---------------------------
// 5. CLIENTES (PROTEGIDAS)
// ---------------------------

router.post('/clientes', authenticateToken, async (req, res) => {
    const { nombre, email, telefono, direccion, tipo_cliente } = req.body;
    const id_usuario = req.user.id;

    if (!nombre || !email || !telefono || !tipo_cliente) {
        return res.status(400).json({
            success: false,
            error: "Nombre, email, teléfono y tipo_cliente son requeridos"
        });
    }

    try {
        const resultado = await crearCliente(nombre, email, telefono, direccion, tipo_cliente, id_usuario);
        res.status(201).json({
            success: true,
            message: "Cliente registrado con éxito",
            id_cliente: resultado.id_cliente
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.get('/clientes', authenticateToken, async (req, res) => {
    try {
        const clientesList = await listarClientes();
        res.status(200).json({ success: true, data: clientesList });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/clientes/:id', authenticateToken, async (req, res) => {
    const id_cliente = req.params.id;

    try {
        const cliente = await obtenerCliente(id_cliente);
        res.status(200).json({ success: true, data: cliente });
    } catch (error) {
        res.status(404).json({ success: false, error: error.message });
    }
});

router.put('/clientes/:id', authenticateToken, async (req, res) => {
    const id_cliente = req.params.id;
    const { nombre, email, telefono, direccion, tipo_cliente } = req.body;

    try {
        await actualizarCliente(id_cliente, nombre, email, telefono, direccion, tipo_cliente);
        res.status(200).json({ success: true, message: "Cliente actualizado con éxito" });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.delete('/clientes/:id', authenticateToken, async (req, res) => {
    const id_cliente = req.params.id;

    try {
        await eliminarCliente(id_cliente);
        res.status(200).json({ success: true, message: "Cliente eliminado con éxito" });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.get('/clientes/buscar/:termino', authenticateToken, async (req, res) => {
    const termino = req.params.termino;

    try {
        const resultados = await buscarClientes(termino);
        res.status(200).json({ success: true, data: resultados });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ---------------------------
// 6. MOVIMIENTOS
// ---------------------------

router.post('/movimientos', authenticateToken, async (req, res) => {
    const { id_producto, tipo_movimiento, cantidad, motivo } = req.body;
    const id_usuario = req.user.id;

    try {
        const resultado = await crearMovimiento(id_producto, tipo_movimiento, cantidad, motivo, id_usuario);
        res.status(201).json({
            success: true,
            message: resultado.message,
            id_movimiento: resultado.id_movimiento,
            nuevoStock: resultado.nuevoStock
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.get('/movimientos/:id_producto', authenticateToken, async (req, res) => {
    const id_producto = req.params.id_producto;

    try {
        const movimientos = await obtenerHistorial(id_producto);
        res.status(200).json({ success: true, movimientos });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/movimientos/estadisticas/:id_producto', authenticateToken, async (req, res) => {
    const id_producto = req.params.id_producto;
    const dias = req.query.dias || 30;

    try {
        const estadisticas = await obtenerEstadisticas(id_producto, dias);
        res.status(200).json({ success: true, estadisticas });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ---------------------------
// 7. MANEJO DE ERRORES
// ---------------------------

// 404 - Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada',
        path: req.path,
        method: req.method
    });
});

// Middleware de error global
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);

    // Errores de validación
    if (err.message.includes('CORS')) {
        return res.status(403).json({
            success: false,
            error: 'Acceso denegado: origen no permitido'
        });
    }

    // Errores de JSON sintaxis
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            success: false,
            error: 'JSON inválido en el cuerpo de la solicitud'
        });
    }

    // Error genérico
    res.status(err.status || 500).json({
        success: false,
        error: config.NODE_ENV === 'production' 
            ? 'Error interno del servidor' 
            : err.message
    });
});

// ---------------------------
// 8. INICIAR SERVIDOR
// ---------------------------
app.listen(config.PORT, () => {
    console.log(`🚀 Servidor backend escuchando en http://localhost:${config.PORT}`);
    console.log(`📝 Entorno: ${config.NODE_ENV}`);
});
