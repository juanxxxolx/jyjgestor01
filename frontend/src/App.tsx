/**
 * @fileoverview Punto de entrada de la aplicación React. Configura el enrutador,
 * el proveedor de React Query, el tema de Ant Design y el contexto de autenticación.
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, theme, Spin } from 'antd';
import esES from 'antd/locale/es_ES';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import AppLayout from './components/AppLayout';
import LoginBackground from './components/LoginBackground';

const LandingPage = lazy(() => import('./pages/Landing'));
const LoginPage = lazy(() => import('./pages/Login'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPassword'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPassword'));
const RegistroPage = lazy(() => import('./pages/Registro'));
const DashboardPage = lazy(() => import('./pages/Dashboard'));
const ClientesPage = lazy(() => import('./pages/Clientes'));
const CategoriasPage = lazy(() => import('./pages/Categorias'));
const ProductosPage = lazy(() => import('./pages/Productos'));
const ExistenciasPage = lazy(() => import('./pages/Existencias'));
const UsuariosPage = lazy(() => import('./pages/Usuarios'));
const AuditoriaPage = lazy(() => import('./pages/Auditoria'));
const VentasPage = lazy(() => import('./pages/Ventas'));
const ReportesPage = lazy(() => import('./pages/Reportes'));
const CotizacionesPage = lazy(() => import('./pages/Cotizaciones'));
const ProveedoresPage = lazy(() => import('./pages/Proveedores'));
const ComprasPage = lazy(() => import('./pages/Compras'));
const CierresCajaPage = lazy(() => import('./pages/CierresCaja'));

function PageLoader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0e1a' }}>
      <LoginBackground />
      <Spin size="large" />
    </div>
  );
}

/** Cliente de React Query con configuración global. */
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

/** Componente interno que aplica el tema y define las rutas de la aplicación. */
function AppContent() {
  const { algorithm } = useTheme();
  return (
    <ConfigProvider locale={esES} theme={{ algorithm }}>
      <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/registro" element={<RegistroPage />} />
              <Route element={<PrivateRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/clientes" element={<ClientesPage />} />
                  <Route path="/categorias" element={<CategoriasPage />} />
                  <Route path="/productos" element={<ProductosPage />} />
                  <Route path="/existencias" element={<ExistenciasPage />} />
                  <Route path="/usuarios" element={<UsuariosPage />} />
                  <Route path="/auditoria" element={<AuditoriaPage />} />
                  <Route path="/ventas" element={<VentasPage />} />
                  <Route path="/reportes" element={<ReportesPage />} />
                  <Route path="/cotizaciones" element={<CotizacionesPage />} />
                  <Route path="/proveedores" element={<ProveedoresPage />} />
                  <Route path="/compras" element={<ComprasPage />} />
                  <Route path="/cierres-caja" element={<CierresCajaPage />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ConfigProvider>
  );
}

/** Componente raíz de la aplicación. Provee tema, React Query y error boundary. */
export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
