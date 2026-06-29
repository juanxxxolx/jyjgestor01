/**
 * ========================================================
 * SANITIZACIÓN Y VALIDACIÓN DE INPUTS
 * ========================================================
 * Previene inyecciones SQL y XSS
 */

const config = require('../config');

/**
 * Sanitiza entrada de texto genérica
 * @param {string} input - Texto a sanitizar
 * @returns {string} Texto sanitizado
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') {
        throw new Error('Input debe ser un string');
    }

    return input
        .trim()
        .replace(/[<>\"'`]/g, '') // Elimina caracteres peligrosos
        .substring(0, 255); // Limita longitud
}

/**
 * Sanitiza email
 * @param {string} email - Email a sanitizar
 * @returns {string} Email sanitizado
 */
function sanitizeEmail(email) {
    return email
        .trim()
        .toLowerCase()
        .substring(0, config.VALIDATION.MAX_EMAIL_LENGTH);
}

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {boolean}
 */
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Valida contraseña según complejidad
 * @param {string} password - Contraseña a validar
 * @param {boolean} strict - Si es true, requiere complejidad alta
 * @returns {object} { valid: boolean, message: string }
 */
function validatePassword(password, strict = false) {
    if (!password || password.length < config.VALIDATION.MIN_PASSWORD_LENGTH) {
        return {
            valid: false,
            message: `La contraseña debe tener al menos ${config.VALIDATION.MIN_PASSWORD_LENGTH} caracteres`
        };
    }

    if (strict && !config.VALIDATION.PASSWORD_COMPLEXITY_REGEX.test(password)) {
        return {
            valid: false,
            message: 'La contraseña debe contener mayúscula, minúscula, número y carácter especial (@$!%*?&)'
        };
    }

    return { valid: true, message: '' };
}

/**
 * Valida nombre de usuario
 * @param {string} nombre - Nombre a validar
 * @returns {boolean}
 */
function validateNombre(nombre) {
    const length = nombre?.trim().length || 0;
    return length >= config.VALIDATION.MIN_NAME_LENGTH && 
           length <= config.VALIDATION.MAX_NAME_LENGTH;
}

/**
 * Valida que sea un número positivo
 * @param {*} value - Valor a validar
 * @returns {boolean}
 */
function validatePositiveNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
}

/**
 * Valida que sea un número entero positivo
 * @param {*} value - Valor a validar
 * @returns {boolean}
 */
function validatePositiveInteger(value) {
    const num = parseInt(value);
    return !isNaN(num) && num > 0 && Number.isInteger(num);
}

module.exports = {
    sanitizeInput,
    sanitizeEmail,
    validateEmail,
    validatePassword,
    validateNombre,
    validatePositiveNumber,
    validatePositiveInteger
};
