import { useState } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth.api';

export function useForgotPassword() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(values.email);
      if (res.token) {
        message.success('Token generado. Redirigiendo al cambio de contraseña...');
        setTimeout(() => navigate(`/reset-password?token=${res.token}`), 1000);
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
