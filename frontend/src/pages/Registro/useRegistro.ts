/**
 * @file Hook personalizado para la página Registro.
 * Gestiona el envío de datos de registro y los estados de carga y éxito.
 */

import { useState } from 'react';
import { message } from 'antd';
import { authApi } from '../../api/auth.api';

/**
 * Hook que maneja el registro de un nuevo usuario.
 * - `onFinish`: llama a `authApi.register` con `{ nombre, email, password }`.
 * - En éxito: marca `success = true` para que el componente muestre la confirmación.
 * - En error: muestra el mensaje del servidor con antd `message`.
 *
 * @returns {object} - `loading` (boolean), `success` (boolean),
 *                     `onFinish` (función `{ nombre, email, password }`).
 */
export function useRegistro() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onFinish = async (values: { nombre: string; email: string; password: string }) => {
    setLoading(true);
    try {
      await authApi.register(values);
      setSuccess(true);
    } catch (e: any) {
      const msg = e.response?.data?.message;
      message.error(Array.isArray(msg) ? msg.join('. ') : msg || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return { loading, success, onFinish };
}
