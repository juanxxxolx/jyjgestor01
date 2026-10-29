/**
 * @file Hook personalizado para la página ResetPassword.
 * Extrae el token de la URL, valida que siga vigente antes de mostrar el
 * formulario y gestiona el envío de la nueva contraseña.
 */

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '../../api/auth.api';

/**
 * Hook que gestiona el restablecimiento de contraseña.
 * - Lee el token del query string `?token=...`.
 * - Valida el token contra el backend al cargar la página.
 * - `onFinish`: llama a `authApi.resetPassword` con el token y la nueva contraseña.
 *
 * @returns {object} - Estados de validación, carga y resultado.
 */
export function useResetPassword() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const { isLoading: validating, isError } = useQuery({
    queryKey: ['reset-token', token],
    queryFn: () => authApi.validateResetToken(token),
    enabled: !!token,
    retry: false,
    staleTime: 0,
  });

  const onFinish = async (values: { password: string; confirmPassword: string }) => {
    setLoading(true);
    try {
      await authApi.resetPassword(token, values.password);
      setSuccess(true);
    } catch {
      // El interceptor global de Axios muestra el mensaje de error
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    success,
    onFinish,
    hasToken: !!token,
    validating,
    tokenInvalid: !!token && isError,
  };
}
