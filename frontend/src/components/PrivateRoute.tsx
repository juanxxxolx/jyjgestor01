/**
 * @fileoverview Componente de ruta protegida. Renderiza el contenido hijo si
 * el usuario está autenticado, de lo contrario redirige al login.
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Ruta protegida que requiere autenticación. */
export default function PrivateRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
