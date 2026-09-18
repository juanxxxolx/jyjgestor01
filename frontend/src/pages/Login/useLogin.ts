/**
 * @file Hook personalizado para la página de Login.
 * Gestiona el estado de carga y la acción de inicio de sesión.
 */

import { useState } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth.api';

/**
 * Hook que maneja el inicio de sesión.
 * - Llama a `authApi.login` con email y contraseña.
 * - En éxito: guarda token y usuario en contexto y redirige a `/dashboard`.
 * - En error: muestra mensaje de error con antd `message`.
 *
 * @returns {object} - `loading` (boolean, true durante la petición),
 *                     `onFinish` (función que recibe `{ email, password }`).
 */
export function useLogin() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await authApi.login(values.email, values.password);
      login(res.token, res.user);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message;
      message.error(Array.isArray(msg) ? msg.join('. ') : msg || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return { loading, onFinish };
}
