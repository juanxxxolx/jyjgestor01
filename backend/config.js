/**
 * ========================================================
 * CONFIGURACIÓN CENTRALIZADA DEL PROYECTO (MEJORADA)
 * ========================================================
 * - Manejo de puertos y variables
 * - CORS mejorado para desarrollo (Live Server / Vite)
 * - Seguridad mejorada para producción
 */

require("dotenv").config();

const config = {
  // ---- SERVIDOR ----
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",

  // ---- DATABASE ----
  DB: {
    HOST: process.env.DB_HOST || "localhost",
    USER: process.env.DB_USER || "root",
    PASSWORD: process.env.DB_PASSWORD || "",
    NAME: process.env.DB_NAME || "gestor_inventario_db",
    POOL_LIMIT: 10,
    QUEUE_LIMIT: 0,
  },

  // ---- SEGURIDAD ----
  JWT_SECRET:
    process.env.JWT_SECRET || "cambiar_esta_clave_secreta_en_produccion_12345",
  JWT_EXPIRE: process.env.JWT_EXPIRE || "7d",
  SALT_ROUNDS: 12,

  // ---- CORS ----
  CORS: {
    /**
     * Lista de orígenes permitidos.
     * IMPORTANTE:
     * - Live Server normalmente usa :5500
     * - Vite normalmente usa :5173
     * - React Create App normalmente usa :3000
     */
ALLOWED_ORIGINS: [
  'http://localhost',
  'http://localhost:80',
  'http://127.0.0.1',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  null
].filter(Boolean),


    CREDENTIALS: true,
    METHODS: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    HEADERS: ["Content-Type", "Authorization"],
  },

  // ---- VALIDACIÓN ----
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 8,
    MIN_NAME_LENGTH: 3,
    MAX_NAME_LENGTH: 100,
    MAX_EMAIL_LENGTH: 255,

    /**
     * Password fuerte:
     * - 1 minúscula
     * - 1 mayúscula
     * - 1 número
     * - 1 símbolo
     * - mínimo 8 caracteres
     */
    PASSWORD_COMPLEXITY_REGEX:
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  },

  // ---- PAGINACIÓN ----
  PAGINATION: {
    DEFAULT_LIMIT: 50,
    MAX_LIMIT: 500,
    DEFAULT_OFFSET: 0,
  },

  // ---- ROLES ----
  ROLES: {
    ADMIN: 1,
    USER: 2,
    GUEST: 3,
  },

  // ---- LOGGING ----
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
};

// ========================================================
// VALIDACIÓN CRÍTICA EN PRODUCCIÓN
// ========================================================
if (config.NODE_ENV === "production") {
  if (
    config.JWT_SECRET === "cambiar_esta_clave_secreta_en_produccion_12345" ||
    !config.JWT_SECRET
  ) {
    console.error(
      "⚠️ CRÍTICO: JWT_SECRET no ha sido configurado correctamente en producción"
    );
    process.exit(1);
  }

  // En producción: si FRONTEND_URL no está definido, mejor bloquear
  if (!process.env.FRONTEND_URL) {
    console.error(
      "⚠️ CRÍTICO: FRONTEND_URL no está definido en producción. CORS podría fallar."
    );
  }
}

module.exports = config;
