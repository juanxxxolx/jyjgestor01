import { Form, Input, Button, Card, Typography } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useLogin } from './useLogin';
import styles from './styles.module.css';

export default function LoginPage() {
  const { loading, onFinish } = useLogin();

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <Typography.Title level={3} className={styles.title}>
          JYJGestor
        </Typography.Title>
        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Email requerido' }]}>
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Contraseña requerida' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Contraseña" size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            Ingresar
          </Button>
          <div className={styles.forgotLink}>
            <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
