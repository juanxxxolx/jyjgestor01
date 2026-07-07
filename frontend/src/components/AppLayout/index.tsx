import { Layout, Menu, Button, Avatar, Space, Typography } from 'antd';
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
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './styles.module.css';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/clientes', icon: <TeamOutlined />, label: 'Clientes' },
  { key: '/categorias', icon: <AppstoreOutlined />, label: 'Categorías' },
  { key: '/ventas', icon: <DollarOutlined />, label: 'Facturación' },
  { key: '/reportes', icon: <BarChartOutlined />, label: 'Reportes' },
  { key: '/productos', icon: <ShoppingCartOutlined />, label: 'Productos' },
  { key: '/existencias', icon: <SwapOutlined />, label: 'Existencias' },
  { key: '/usuarios', icon: <UserOutlined />, label: 'Usuarios' },
  { key: '/auditoria', icon: <SafetyCertificateOutlined />, label: 'Auditoría' },
];

export default function AppLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const visibleItems = isAdmin ? menuItems : menuItems.filter((i) => !['/usuarios', '/auditoria'].includes(i.key));

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
        <Header className={styles.header}>
          <Space>
            <Avatar icon={<UserOutlined />} />
            <Typography.Text>{user?.nombre}</Typography.Text>
            <Button icon={<LogoutOutlined />} onClick={logout} type="text">
              Salir
            </Button>
          </Space>
        </Header>
        <Content className={styles.content}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
