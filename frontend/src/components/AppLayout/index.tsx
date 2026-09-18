/**
 * @fileoverview Layout principal de la aplicación para rutas autenticadas.
 * Incluye el menú lateral de navegación, el header con perfil y tema,
 * y el contenido principal. Muestra alerta de productos con stock bajo.
 */

import { useState } from 'react';
import { Layout, Menu, Button, Avatar, Space, Typography, Modal, Form, Input, message, Divider, Badge } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  SwapOutlined,
  UserOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  SafetyCertificateOutlined,
  DollarOutlined,
  BarChartOutlined,
  MoonOutlined,
  SunOutlined,
  SettingOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/client';
import styles from './styles.module.css';

const { Header, Sider, Content } = Layout;

/** Layout con sidebar, header y área de contenido para las páginas protegidas. */
export default function AppLayout() {
  const { user, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [form] = Form.useForm();

  const { data: bajoStock } = useQuery({
    queryKey: ['bajo-stock-alert'],
    queryFn: () => api.get('/productos/bajo-stock').then((r) => r.data),
    refetchInterval: 30_000,
  });
  const bajoStockCount = bajoStock?.data?.length ?? 0;

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/clientes', icon: <TeamOutlined />, label: 'Clientes' },
    { key: '/categorias', icon: <AppstoreOutlined />, label: 'Categorías' },
    { key: '/ventas', icon: <DollarOutlined />, label: 'Facturación' },
    { key: '/cotizaciones', icon: <ShoppingCartOutlined />, label: 'Cotizaciones' },
    { key: '/reportes', icon: <BarChartOutlined />, label: 'Reportes' },
    { key: '/productos', icon: <ShoppingCartOutlined />, label: bajoStockCount > 0 ? <span style={{ color: 'rgba(255,255,255,0.85)' }}>Productos <Badge count={bajoStockCount} size="small" /></span> : 'Productos' },
    { key: '/existencias', icon: <SwapOutlined />, label: 'Existencias' },
    { key: '/proveedores', icon: <TeamOutlined />, label: 'Proveedores' },
    { key: '/compras', icon: <ShoppingCartOutlined />, label: 'Compras' },
    { key: '/cierres-caja', icon: <DollarOutlined />, label: 'Arqueo Caja' },
    { key: '/usuarios', icon: <UserOutlined />, label: 'Usuarios' },
    { key: '/auditoria', icon: <SafetyCertificateOutlined />, label: 'Auditoría' },
  ];

  const visibleItems = isAdmin ? menuItems : menuItems.filter((i) => !['/usuarios', '/auditoria'].includes(i.key));

  const handleChangePassword = async (values: { currentPassword: string; newPassword: string }) => {
    try {
      await api.post('/auth/change-password', values);
      message.success('Contraseña actualizada');
      setProfileOpen(false);
      form.resetFields();
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Error al cambiar contraseña');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0" theme="dark">
        <div className={styles.logo}>
          <Typography.Text strong className={styles.logoText}>
            JYJGestor
          </Typography.Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={visibleItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header className={styles.header} style={{ background: isDark ? '#141414' : '#fff' }}>
          <div className={styles.headerRight}>
            <Button icon={isDark ? <SunOutlined /> : <MoonOutlined />} onClick={toggleTheme} type="text">
              <span className={styles.hideMobile}>{isDark ? 'Claro' : 'Oscuro'}</span>
            </Button>
            <Button icon={<SettingOutlined />} onClick={() => setProfileOpen(true)} type="text">
              <span className={styles.hideMobile}>Perfil</span>
            </Button>
            <div className={styles.userInfo}>
              <Avatar size="small" icon={<UserOutlined />} />
              <Typography.Text ellipsis className={styles.userName}>{user?.nombre}</Typography.Text>
            </div>
            <Button icon={<LogoutOutlined />} onClick={logout} type="text">
              <span className={styles.hideMobile}>Salir</span>
            </Button>
          </div>
        </Header>
        <Content className={styles.content} style={{ background: isDark ? '#141414' : '#f0f2f5' }}>
          <Outlet />
        </Content>
      </Layout>

      <Modal
        title="Mi Perfil"
        open={profileOpen}
        onCancel={() => { setProfileOpen(false); form.resetFields(); }}
        footer={null}
      >
        <Typography.Text strong>Usuario:</Typography.Text>
        <Typography.Paragraph>{user?.nombre} ({user?.email})</Typography.Paragraph>
        <Typography.Text strong>Rol:</Typography.Text>
        <Typography.Paragraph>{user?.rol === 1 ? 'Administrador' : 'Usuario'}</Typography.Paragraph>
        <Divider />
        <Typography.Title level={5}>Cambiar contraseña</Typography.Title>
        <Form form={form} layout="vertical" onFinish={handleChangePassword}>
          <Form.Item name="currentPassword" label="Contraseña actual" rules={[{ required: true, message: 'Requerida' }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="newPassword" label="Nueva contraseña" rules={[{ required: true, min: 6, message: 'Mínimo 6 caracteres' }]}>
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit">Actualizar contraseña</Button>
        </Form>
      </Modal>
    </Layout>
  );
}
