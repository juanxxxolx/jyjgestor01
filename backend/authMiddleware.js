const jwt = require('jsonwebtoken');
const config = require('./config');

const JWT_SECRET = config.JWT_SECRET;

/**
 * Middleware para verificar y autenticar el token JWT.
 * Valida que el token sea válido y no esté expirado.
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Espera: "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Acceso denegado. No se proporcionó token.'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.warn('⚠️ Token inválido o expirado:', err.message);
            
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    error: 'Token expirado. Por favor, inicia sesión nuevamente.'
                });
            }

            return res.status(403).json({
                success: false,
                error: 'Token inválido.'
            });
        }
        
        // Adjunta los datos del usuario (id, email, rol) a la solicitud
        req.user = user;
        next();
    });
}

/**
 * Función de autorización basada en roles.
 * @param {...string} requiredRoles - Roles permitidos (ej: authorizeRoles(1, 2))
 * @returns {Function} Middleware
 */
function authorizeRoles(...requiredRoles) {
    return (req, res, next) => {
        if (!req.user || !req.user.rol) {
            return res.status(401).json({
                success: false,
                error: 'Error de autenticación: Rol no definido.'
            });
        }

        // Verificar si el rol del usuario está en los roles permitidos
        if (requiredRoles.includes(req.user.rol)) {
            next();
        } else {
            console.warn(`⚠️ Acceso denegado para usuario ${req.user.id} con rol ${req.user.rol}`);
            res.status(403).json({
                success: false,
                error: 'Permiso denegado. Rol insuficiente para esta acción.'
            });
        }
    };
}

/**
 * Middleware que valida que el usuario sea propietario del recurso
 * o sea administrador
 */
function authorizeOwnerOrAdmin(req, res, next) {
    const resourceUserId = parseInt(req.params.userId || req.body.userId);
    const requestingUserId = req.user.id;
    const isAdmin = req.user.rol === config.ROLES.ADMIN;

    if (isAdmin || requestingUserId === resourceUserId) {
        next();
    } else {
        res.status(403).json({
            success: false,
            error: 'No tienes permiso para acceder a este recurso.'
        });
    }
}

// 👈 ESTAS LÍNEAS SON CRÍTICAS: Exporta todas las funciones
module.exports = {
    authenticateToken,
    authorizeRoles,
    authorizeOwnerOrAdmin
};
