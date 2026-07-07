import { Form, Input, Button, Card, Typography } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useForgotPassword } from './useForgotPassword';
import styles from './styles.module.css';

export default function ForgotPasswordPage() {
  const { loading, onFinish } = useForgotPassword();

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <Typography.Title level={3} className={styles.title}>
          Recuperar contraseña
        </Typography.Title>
        <Typography.Text type="secondary" className={styles.subtitle}>
          Ingresa tu email para recibir un enlace de recuperación
        </Typography.Text>
        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Email requerido' }]}>
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            Enviar
          </Button>
        </Form>
      </Card>
    </div>
  );
}
