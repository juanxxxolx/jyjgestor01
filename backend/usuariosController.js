// backend/usuariosController.js

const db = require('./conexion');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('./config');
const {
  sanitizeInput,
  sanitizeEmail,
  validateEmail,
  validatePassword,
  validateNombre
} = require('./utils/sanitizer');

/**
 * Crea un nuevo usuario con validaciones y seguridad mejorada
 * @param {string} nombre - Nombre del usuario
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña sin hash
 * @param {number} id_rol - ID del rol (default: 2 = usuario normal)
 * @returns {Promise<Object>}
 */
async function crearUsuario(nombre, email, password, id_rol = config.ROLES.USER) {
  try {
    // 1. SANITIZAR ENTRADA
    nombre = sanitizeInput(nombre);
    email = sanitizeEmail(email);

    // 2. VALIDAR ENTRADA
    if (!validateNombre(nombre)) {
      throw new Error(
        `El nombre debe tener entre ${config.VALIDATION.MIN_NAME_LENGTH} y ${config.VALIDATION.MAX_NAME_LENGTH} caracteres`
      );
    }

    if (!validateEmail(email)) {
      throw new Error("El email no es válido");
    }

    const passwordValidation = validatePassword(password, true);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }

    // 3. GENERAR HASH DE CONTRASEÑA
    const password_hash = await bcrypt.hash(password, config.SALT_ROUNDS);

    // 4. INSERTAR USUARIO
    const query = `
            INSERT INTO usuarios (nombre, email, password_hash, id_rol, activo)
            VALUES (?, ?, ?, ?, TRUE);
        `;

    const [result] = await db.execute(query, [nombre, email, password_hash, id_rol]);

    console.log(`✅ Usuario creado con ID: ${result.insertId}`);

    return {
      success: true,
      message: 'Usuario registrado correctamente',
      userId: result.insertId
    };

  } catch (error) {
    console.error('❌ Error al crear usuario:', error.message);

    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error("El correo electrónico ya está registrado");
    }

    throw error;
  }
}

/**
 * Autentica un usuario y genera token JWT
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña sin hash
 * @returns {Promise<Object>}
 */
async function loginUsuario(email, password) {
  try {
    // 1. VALIDAR ENTRADA
    email = sanitizeEmail(email);

    if (!validateEmail(email)) {
      throw new Error('Email inválido');
    }

    if (!password) {
      throw new Error('Contraseña requerida');
    }

    // 2. BUSCAR USUARIO POR EMAIL
    const [rows] = await db.execute(
      `SELECT id_usuario, nombre, email, password_hash, id_rol, activo 
             FROM usuarios 
             WHERE email = ? AND activo = TRUE`,
      [email]
    );

    if (rows.length === 0) {
      throw new Error('Credenciales inválidas');
    }

    const usuario = rows[0];

    // 3. VERIFICAR CONTRASEÑA
    const match = await bcrypt.compare(password, usuario.password_hash);

    if (!match) {
      throw new Error('Credenciales inválidas');
    }

    // 4. GENERAR JWT CON EXPIRACIÓN
    const token = jwt.sign(
      {
        id: usuario.id_usuario,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.id_rol
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRE }
    );

    console.log(`✅ Login exitoso para: ${email}`);

    return {
      success: true,
      token,
      user: {
        id: usuario.id_usuario,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.id_rol
      }
    };

  } catch (error) {
    console.error('❌ Error en login:', error.message);
    throw error;
  }
}

/**
 * Obtiene datos de un usuario sin exponer información sensible
 * @param {number} id_usuario - ID del usuario
 * @returns {Promise<Object>}
 */
async function obtenerUsuario(id_usuario) {
  try {
    const [rows] = await db.execute(
      'SELECT id_usuario, nombre, email, id_rol, activo, fecha_creacion FROM usuarios WHERE id_usuario = ?',
      [id_usuario]
    );

    if (rows.length === 0) {
      throw new Error('Usuario no encontrado');
    }

    return { success: true, usuario: rows[0] };

  } catch (error) {
    console.error('Error al obtener usuario:', error.message);
    throw error;
  }
}

/**
 * Actualiza datos de un usuario (sin contraseña)
 * @param {number} id_usuario - ID del usuario
 * @param {string} nombre - Nuevo nombre
 * @param {string} email - Nuevo email
 * @returns {Promise<Object>}
 */
async function actualizarUsuario(id_usuario, nombre, email) {
  try {
    // SANITIZAR Y VALIDAR
    if (nombre) {
      nombre = sanitizeInput(nombre);
      if (!validateNombre(nombre)) {
        throw new Error(
          `El nombre debe tener entre ${config.VALIDATION.MIN_NAME_LENGTH} y ${config.VALIDATION.MAX_NAME_LENGTH} caracteres`
        );
      }
    }

    if (email) {
      email = sanitizeEmail(email);
      if (!validateEmail(email)) {
        throw new Error("El email no es válido");
      }
    }

    const query = 'UPDATE usuarios SET nombre = ?, email = ? WHERE id_usuario = ?';
    const [result] = await db.execute(query, [nombre, email, id_usuario]);

    if (result.affectedRows === 0) {
      throw new Error('Usuario no encontrado');
    }

    console.log(`✅ Usuario ${id_usuario} actualizado`);

    return { success: true, message: 'Usuario actualizado correctamente' };

  } catch (error) {
    console.error('Error al actualizar usuario:', error.message);
    throw error;
  }
}

/**
 * Cambia la contraseña de un usuario con validación de la anterior
 * @param {number} id_usuario - ID del usuario
 * @param {string} password_antigua - Contraseña actual
 * @param {string} password_nueva - Nueva contraseña
 * @returns {Promise<Object>}
 */
async function cambiarContrasena(id_usuario, password_antigua, password_nueva) {
  try {
    // VALIDAR NUEVA CONTRASEÑA
    const passwordValidation = validatePassword(password_nueva, true);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }

    if (password_antigua === password_nueva) {
      throw new Error('La nueva contraseña debe ser diferente a la actual');
    }

    // OBTENER HASH ACTUAL
    const [rows] = await db.execute(
      'SELECT password_hash FROM usuarios WHERE id_usuario = ?',
      [id_usuario]
    );

    if (rows.length === 0) {
      throw new Error('Usuario no encontrado');
    }

    // VERIFICAR CONTRASEÑA ANTIGUA
    const match = await bcrypt.compare(password_antigua, rows[0].password_hash);
    if (!match) {
      throw new Error('Contraseña actual incorrecta');
    }

    // GENERAR NUEVO HASH
    const password_hash = await bcrypt.hash(password_nueva, config.SALT_ROUNDS);

    // ACTUALIZAR
    await db.execute(
      'UPDATE usuarios SET password_hash = ? WHERE id_usuario = ?',
      [password_hash, id_usuario]
    );

    console.log(`✅ Contraseña actualizada para usuario ${id_usuario}`);

    return { success: true, message: 'Contraseña actualizada correctamente' };

  } catch (error) {
    console.error('Error al cambiar contraseña:', error.message);
    throw error;
  }
}

/**
 * Elimina un usuario (desactivación lógica recomendada)
 * @param {number} id_usuario - ID del usuario
 * @returns {Promise<Object>}
 */
async function eliminarUsuario(id_usuario) {
  try {
    // DESACTIVAR EN VEZ DE ELIMINAR (mejor práctica)
    const [result] = await db.execute(
      'UPDATE usuarios SET activo = FALSE WHERE id_usuario = ?',
      [id_usuario]
    );

    if (result.affectedRows === 0) {
      throw new Error('Usuario no encontrado');
    }

    console.log(`✅ Usuario ${id_usuario} desactivado`);

    return { success: true, message: 'Usuario eliminado correctamente' };

  } catch (error) {
    console.error('Error al eliminar usuario:', error.message);
    throw error;
  }
}

// --- EXPORTACIÓN ---
module.exports = {
  crearUsuario,
  loginUsuario,
  obtenerUsuario,
  actualizarUsuario,
  cambiarContrasena,
  eliminarUsuario,
  validateEmail
};
