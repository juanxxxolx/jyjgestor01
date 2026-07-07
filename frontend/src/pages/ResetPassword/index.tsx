import { Form, Input, Button, Card, Typography } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useResetPassword } from './useResetPassword';
import styles from './styles.module.css';

export default function ResetPasswordPage() {
  const { loading, onFinish, hasToken } = useResetPassword();

  if (!hasToken) {
    return (
      <div className={styles.container}>
        <Card className={styles.card}>
          <Typography.Title level={4} className={styles.title}>
            Enlace inválido
          </Typography.Title>
          <Typography.Text type="secondary">
            No se encontró un token de recuperación. Solicita uno nuevo.
          </Typography.Text>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <Typography.Title level={3} className={styles.title}>
          Nueva contraseña
        </Typography.Title>
        <Typography.Text type="secondary" className={styles.subtitle}>
          Ingresa tu nueva contraseña
        </Typography.Text>
        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Contraseña requerida' },
              { min: 8, message: 'Mínimo 8 caracteres' },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                message: 'Debe tener mayúscula, minúscula, número y símbolo (@$!%*?&)',
              },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nueva contraseña" size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            Restablecer contraseña
          </Button>
        </Form>
      </Card>
    </div>
  );
}
