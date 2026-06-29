/**
 * ========================================================
 * MIDDLEWARE DE VALIDACIÓN
 * ========================================================
 * Valida y sanitiza inputs en solicitudes HTTP
 */

const { 
    sanitizeInput, 
    validateEmail, 
    validatePositiveNumber,
    validatePositiveInteger 
} = require('../utils/sanitizer');

/**
 * Middleware que valida que el body contenga campos requeridos
 * @param {...string} requiredFields - Campos requeridos
 */
function validateRequiredFields(...requiredFields) {
    return (req, res, next) => {
        const missing = requiredFields.filter(field => !req.body[field]);
        
        if (missing.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Campos requeridos faltantes: ${missing.join(', ')}`
            });
        }
        
        next();
    };
}

/**
 * Valida que un campo sea una email válido
 */
function validateEmailField(fieldName = 'email') {
    return (req, res, next) => {
        const email = req.body[fieldName];
        
        if (!email || !validateEmail(email)) {
            return res.status(400).json({
                success: false,
                error: `Campo '${fieldName}' no es un email válido`
            });
        }
        
        req.body[fieldName] = email.toLowerCase().trim();
        next();
    };
}

/**
 * Valida que un campo sea un número positivo
 */
function validateNumberField(fieldName) {
    return (req, res, next) => {
        if (!validatePositiveNumber(req.body[fieldName])) {
            return res.status(400).json({
                success: false,
                error: `Campo '${fieldName}' debe ser un número positivo`
            });
        }
        
        req.body[fieldName] = parseFloat(req.body[fieldName]);
        next();
    };
}

/**
 * Valida que un campo sea un entero positivo
 */
function validateIntegerField(fieldName) {
    return (req, res, next) => {
        if (!validatePositiveInteger(req.body[fieldName])) {
            return res.status(400).json({
                success: false,
                error: `Campo '${fieldName}' debe ser un número entero positivo`
            });
        }
        
        req.body[fieldName] = parseInt(req.body[fieldName]);
        next();
    };
}

/**
 * Sanitiza campos de texto
 * @param {...string} fieldNames - Campos a sanitizar
 */
function sanitizeFields(...fieldNames) {
    return (req, res, next) => {
        fieldNames.forEach(field => {
            if (req.body[field] && typeof req.body[field] === 'string') {
                req.body[field] = sanitizeInput(req.body[field]);
            }
        });
        
        next();
    };
}

module.exports = {
    validateRequiredFields,
    validateEmailField,
    validateNumberField,
    validateIntegerField,
    sanitizeFields
};
