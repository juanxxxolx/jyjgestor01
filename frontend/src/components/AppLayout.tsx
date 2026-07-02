import { Layout, Menu, Button, Avatar, Space, Typography } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  SwapOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/clientes', icon: <TeamOutlined />, label: 'Clientes' },
  { key: '/productos', icon: <ShoppingCartOutlined />, label: 'Productos' },
  { key: '/existencias', icon: <SwapOutlined />, label: 'Existencias' },
  { key: '/usuarios', icon: <UserOutlined />, label: 'Usuarios' },
];

export default function AppLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const visibleItems = isAdmin ? menuItems : menuItems.filter((i) => i.key !== '/usuarios');

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0" theme="dark">
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Typography.Text strong style={{ color: 'white', fontSize: 18 }}>
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
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,.1)',
          }}
        >
          <Space>
            <Avatar icon={<UserOutlined />} />
            <Typography.Text>{user?.nombre}</Typography.Text>
            <Button icon={<LogoutOutlined />} onClick={logout} type="text">
              Salir
            </Button>
          </Space>
        </Header>
        <Content style={{ margin: '24px', background: '#f0f2f5' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
