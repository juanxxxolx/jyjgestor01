/**
 * @file Hook personalizado para la página ForgotPassword.
 * Gestiona el envío de la solicitud de recuperación. Por seguridad el backend
 * no devuelve el token: el enlace llega por correo o lo genera un administrador.
 */

import { useState } from 'react';
import { authApi } from '../../api/auth.api';

/**
 * Hook que maneja la solicitud de recuperación de contraseña.
 * - Llama a `authApi.forgotPassword` con el email.
 * - Muestra siempre el mismo mensaje de confirmación, exista o no la cuenta.
 *
 * @returns {object} - `loading`, `sent`, `email`, `onFinish` y `reset`.
 */
export function useForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');

  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(values.email);
      setEmail(values.email);
      setSent(true);
    } catch {
      // El interceptor global de Axios ya muestra el mensaje de error
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSent(false);
    setEmail('');
  };

  return { loading, sent, email, onFinish, reset };
}
