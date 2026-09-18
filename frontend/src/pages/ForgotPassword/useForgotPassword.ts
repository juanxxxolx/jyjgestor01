/**
 * @file Hook personalizado para la página ForgotPassword.
 * Gestiona el envío del email de recuperación y la respuesta del servidor.
 */

import { useState } from 'react';
import { message, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth.api';

/**
 * Hook que maneja la solicitud de recuperación de contraseña.
 * - Llama a `authApi.forgotPassword` con el email.
 * - Si recibe un token, muestra un Modal confirmando y redirige a
 *   `/reset-password?token=...` (simulación; en producción se enviaría por correo).
 * - Si no recibe token, muestra mensaje de éxito y redirige a `/login`.
 *
 * @returns {object} - `loading` (boolean), `onFinish` (función `{ email }`).
 */
export function useForgotPassword() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(values.email);
      if (res.token) {
        Modal.confirm({
          title: 'Token generado',
          content: 'Token: ' + res.token + '\n\nEn produccion se enviaria por correo.',
          okText: 'Ir a restablecer',
          onOk: () => navigate('/reset-password?token=' + res.token),
          onCancel: () => {},
        });
      } else {
        message.success(res.message);
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Error al procesar solicitud');
    } finally {
      setLoading(false);
    }
  };

  return { loading, onFinish };
}
