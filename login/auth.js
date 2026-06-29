/**
 * =========================================================
 * AUTENTICACIÓN FRONTEND - LOGIN
 * =========================================================
 * Maneja login de usuarios con validación mejorada
 */

const API_BASE_URL = 'http://localhost:3000/api';
const TOKEN_KEY = 'token';
const USER_KEY = 'usuario';

/**
 * Realiza login del usuario
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>}
 */
async function loginUser(email, password) {
  try {
    email = (email || '').trim().toLowerCase();
    password = password || '';

    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Email no válido');
    }

    const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    // 🔥 MOSTRAR ERROR REAL DEL BACKEND
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.error || 'Error al iniciar sesión');
    }

    // Si llega aquí, todo OK
    if (data?.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
    }

    if (data?.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }

    return {
      success: true,
      message: data?.message || 'Inicio de sesión exitoso.',
      user: data?.user
    };

  } catch (error) {
    console.error("❌ Error en login:", error);
    return {
      success: false,
      message: error.message || "No se pudo conectar con el servidor."
    };
  }
}

/**
 * Realiza logout del usuario
 */
function logoutUser() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = '../login/login.html';
}

/**
 * Registra un nuevo usuario
 * @param {string} nombre
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>}
 */
async function registerUser(nombre, email, password) {
  try {
    nombre = (nombre || '').trim();
    email = (email || '').trim().toLowerCase();
    password = password || '';

    if (!nombre || nombre.length < 3) {
      throw new Error('El nombre debe tener al menos 3 caracteres');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Email no válido');
    }

    if (!password || password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    const response = await fetch(`${API_BASE_URL}/usuarios/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.error || "Error al registrar usuario");
    }

    if (data?.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
    }

    if (data?.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }

    return {
      success: true,
      message: data?.message || "Usuario registrado correctamente",
      user: data?.user
    };

  } catch (error) {
    console.error("❌ Error en registro:", error);
    return {
      success: false,
      message: error.message || "No se pudo registrar."
    };
  }
}

// ==================== MANEJO DE FORMULARIO ====================
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const messageContainer = document.getElementById('auth-message');

  // LOGIN
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email')?.value || '';
      const password = document.getElementById('password')?.value || '';

      if (messageContainer) {
        messageContainer.textContent = "Iniciando sesión...";
        messageContainer.style.color = '#007bff';
      }

      const result = await loginUser(email, password);

      if (messageContainer) {
        messageContainer.textContent = result.message;
        messageContainer.style.color = result.success ? 'green' : 'red';
      }

      if (result.success) {
        setTimeout(() => {
          const path = window.location.pathname.replace(
            '/login/login.html',
            '/pagina_principal/pg_principal.html'
          );
          window.location.href = path;
        }, 800);
      }
    });
  }

  // REGISTRO
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nombre = document.getElementById('nombre')?.value || '';
      const email = document.getElementById('email')?.value || '';
      const password = document.getElementById('password')?.value || '';
      const passwordConfirm = document.getElementById('password-confirm')?.value || '';

      if (password !== passwordConfirm) {
        if (messageContainer) {
          messageContainer.textContent = 'Las contraseñas no coinciden';
          messageContainer.style.color = 'red';
        }
        return;
      }

      if (messageContainer) {
        messageContainer.textContent = "Registrando usuario...";
        messageContainer.style.color = '#007bff';
      }

      const result = await registerUser(nombre, email, password);

      if (messageContainer) {
        messageContainer.textContent = result.message;
        messageContainer.style.color = result.success ? 'green' : 'red';
      }

      if (result.success) {
        setTimeout(() => {
          const path = window.location.pathname.replace(
            '/login/login.html',
            '/pagina_principal/pg_principal.html'
          );
          window.location.href = path;
        }, 1000);
      }
    });
  }
});
