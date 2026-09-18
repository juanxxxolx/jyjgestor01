/**
 * @file Página de aterrizaje (Landing / Portada).
 * Pantalla de bienvenida con el logo de JYJGestor y un botón
 * para acceder al inicio de sesión.
 */

import { Button, Card, Typography, Space } from 'antd';
import { LockOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useLanding } from './useLanding';
import LoginBackground from '../../components/LoginBackground';
import styles from './styles.module.css';

/**
 * Componente de la página Landing.
 * Renderiza una tarjeta centrada con el ícono de la aplicación,
 * el nombre "JYJGestor", el lema "Gestión de inventario inteligente"
 * y un botón "Iniciar Sesión" que redirige a `/login`.
 * Si el usuario ya está autenticado, redirige automáticamente a `/dashboard`.
 */
export default function LandingPage() {
  const { goLogin } = useLanding();

  return (
    <div className={styles.container}>
      <LoginBackground />
      <Card className={styles.card}>
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          <div className={styles.logoSection}>
            <ShoppingOutlined className={styles.logoIcon} />
            <Typography.Title level={2} className={styles.title}>
              JYJGestor
            </Typography.Title>
            <Typography.Text type="secondary" className={styles.subtitle}>
              Gestión de inventario inteligente
            </Typography.Text>
          </div>

          <Button type="primary" size="large" icon={<LockOutlined />} block onClick={goLogin}>
            Iniciar Sesión
          </Button>
        </Space>
      </Card>
    </div>
  );
}
