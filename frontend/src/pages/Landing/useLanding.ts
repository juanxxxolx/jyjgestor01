/**
 * @file Hook personalizado para la página Landing.
 * Redirige al dashboard si el usuario ya está autenticado
 * y provee la función para navegar al login.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Hook que controla la navegación desde la Landing.
 * - Efecto: si `isAuthenticated` es true, redirige a `/dashboard`.
 * - `goLogin`: navega a la ruta `/login`.
 *
 * @returns {object} - `goLogin` (función sin parámetros).
 */
export function useLanding() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const goLogin = () => navigate('/login');

  return { goLogin };
}
