/**
 * @file Hook personalizado para la página ResetPassword.
 * Extrae el token de la URL, maneja el envío de la nueva contraseña
 * y los estados de carga y éxito.
 */

import { useState } from 'react';
import { message } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/auth.api';

/**
 * Hook que gestiona el restablecimiento de contraseña.
 * - Lee el token del query string `?token=...`.
 * - `onFinish`: llama a `authApi.resetPassword` con el token y la nueva contraseña.
 * - En éxito: marca `success = true` para que el componente muestre el resultado.
 * - En error: muestra mensaje con antd `message`.
 *
 * @returns {object} - `loading` (boolean), `success` (boolean),
 *                     `onFinish` (función `{ password }`),
 *                     `hasToken` (boolean, true si hay token en la URL).
 */
export function useResetPassword() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const onFinish = async (values: { password: string }) => {
    setLoading(true);
    try {
      await authApi.resetPassword(token, values.password);
      setSuccess(true);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Error al restablecer contraseña');
    } finally {
      setLoading(false);
    }
  };

  return { loading, success, onFinish, hasToken: !!token };
}
