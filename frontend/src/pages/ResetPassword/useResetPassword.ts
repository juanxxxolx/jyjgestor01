import { useState } from 'react';
import { message } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/auth.api';

export function useResetPassword() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const onFinish = async (values: { password: string }) => {
    setLoading(true);
    try {
      await authApi.resetPassword(token, values.password);
      message.success('Contraseña actualizada. Redirigiendo al login...');
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Error al restablecer contraseña');
    } finally {
      setLoading(false);
    }
  };

  return { loading, onFinish, hasToken: !!token };
}
