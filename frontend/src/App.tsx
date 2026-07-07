import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, theme } from 'antd';
import esES from 'antd/locale/es_ES';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import AppLayout from './components/AppLayout';
import LandingPage from './pages/Landing';
import LoginPage from './pages/Login';
import ForgotPasswordPage from './pages/ForgotPassword';
import ResetPasswordPage from './pages/ResetPassword';
import DashboardPage from './pages/Dashboard';
import ClientesPage from './pages/Clientes';
import CategoriasPage from './pages/Categorias';
import ProductosPage from './pages/Productos';
import ExistenciasPage from './pages/Existencias';
import UsuariosPage from './pages/Usuarios';
import AuditoriaPage from './pages/Auditoria';
import VentasPage from './pages/Ventas';
import ReportesPage from './pages/Reportes';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function AppContent() {
  const { algorithm } = useTheme();
  return (
    <ConfigProvider locale={esES} theme={{ algorithm }}>
      <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
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
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ConfigProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
