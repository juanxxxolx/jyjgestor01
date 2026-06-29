/**
 * ========================================================
 * CLIENTE API CENTRALIZADO
 * ========================================================
 * Centraliza todas las llamadas a API
 * - Manejo automático de tokens
 * - Manejo centralizado de errores
 * - Logging consistente
 * - Retry automático en fallos de red
 */

const API_BASE = 'http://localhost:3000/api';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

class APIClient {
    constructor() {
        this.baseURL = API_BASE;
        this.retryCount = 0;
    }

    /**
     * Obtiene el token del localStorage
     * @returns {string|null}
     */
    getToken() {
        return localStorage.getItem(TOKEN_KEY);
    }

    /**
     * Verifica si el token existe y es válido
     * @returns {boolean}
     */
    isAuthenticated() {
        const token = this.getToken();
        return token !== null && token !== '';
    }

    /**
     * Obtiene los headers con autenticación
     * @returns {object}
     */
    getHeaders(additionalHeaders = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...additionalHeaders
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    /**
     * Maneja errores de autenticación
     */
    handleUnauthorized() {
        console.warn('⚠️ Sesión expirada o no autorizado');
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        
        // Redirigir a login si no estamos ya allí
        if (!window.location.pathname.includes('login')) {
            window.location.href = '../login/login.html';
        }
    }

    /**
     * Realiza una solicitud HTTP con reintentos
     * @param {string} endpoint - Ruta relativa a API_BASE
     * @param {object} options - Opciones de fetch
     * @returns {Promise<any>} Respuesta parseada
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const defaultOptions = {
            headers: this.getHeaders(options.headers),
            ...options
        };

        try {
            console.log(`📤 ${defaultOptions.method || 'GET'} ${endpoint}`);

            const response = await fetch(url, defaultOptions);

            // Manejo de autenticación expirada
            if (response.status === 401 || response.status === 403) {
                this.handleUnauthorized();
                throw new Error('No autorizado');
            }

            // Intentar parsear respuesta como JSON
            const contentType = response.headers.get('content-type');
            let data = null;

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                if (text) {
                    try {
                        data = JSON.parse(text);
                    } catch {
                        data = { raw: text };
                    }
                }
            }

            // Si no es 2xx, lanzar error
            if (!response.ok) {
                const errorMsg = data?.error || data?.message || `Error HTTP ${response.status}`;
                console.error(`❌ Error: ${errorMsg}`);
                throw new Error(errorMsg);
            }

            console.log(`✅ ${defaultOptions.method || 'GET'} ${endpoint}`);
            return data;

        } catch (error) {
            // Reintentar si es error de red
            if (error instanceof TypeError && this.retryCount < MAX_RETRIES) {
                this.retryCount++;
                console.warn(`🔄 Reintentando (${this.retryCount}/${MAX_RETRIES})...`);
                
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                return this.request(endpoint, options);
            }

            this.retryCount = 0;
            console.error(`❌ Error en solicitud: ${error.message}`);
            throw error;
        }
    }

    /**
     * Métodos convenientes HTTP
     */
    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    patch(endpoint, data) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    /**
     * Realiza múltiples solicitudes en paralelo
     * @param {Array} requests - Array de { method, endpoint, data? }
     * @returns {Promise<Array>}
     */
    async batch(requests) {
        return Promise.all(
            requests.map(req => {
                if (req.method === 'GET') return this.get(req.endpoint);
                if (req.method === 'POST') return this.post(req.endpoint, req.data);
                if (req.method === 'PUT') return this.put(req.endpoint, req.data);
                if (req.method === 'DELETE') return this.delete(req.endpoint);
                throw new Error(`Método no soportado: ${req.method}`);
            })
        );
    }
}

// Instancia global
const api = new APIClient();

/**
 * Función helper para mostrar mensajes al usuario
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duración en ms (0 = permanente)
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Crear elemento si no existe
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999;';
        document.body.appendChild(container);
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        padding: 12px 16px;
        margin-bottom: 10px;
        border-radius: 4px;
        background-color: ${
            type === 'success' ? '#4caf50' :
            type === 'error' ? '#f44336' :
            type === 'warning' ? '#ff9800' :
            '#2196f3'
        };
        color: white;
        font-size: 14px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease-in-out;
    `;
    notification.textContent = message;
    container.appendChild(notification);

    if (duration > 0) {
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in-out';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
}

/**
 * Valida autenticación y redirige si falta token
 */
function requireAuthentication() {
    if (!api.isAuthenticated()) {
        console.warn('⚠️ Acceso denegado: no hay token');
        window.location.href = '../login/login.html';
        return false;
    }
    return true;
}

// Agregar estilos de animación
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateX(100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            @keyframes slideOut {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(100%);
                }
            }
        `;
        document.head.appendChild(style);
    }
});
