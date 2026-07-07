import { Button, Card, Typography, Space } from 'antd';
import { LockOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useLanding } from './useLanding';
import styles from './styles.module.css';

export default function LandingPage() {
  const { goLogin } = useLanding();

  return (
    <div className={styles.container}>
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
