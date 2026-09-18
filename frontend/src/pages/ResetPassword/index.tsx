/**
 * @file Página de restablecimiento de contraseña (Reset Password).
 * Permite al usuario establecer una nueva contraseña usando un token
 * de recuperación recibido por correo.
 */

import { Form, Input, Button, Card, Typography, Result } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useResetPassword } from './useResetPassword';
import LoginBackground from '../../components/LoginBackground';
import styles from './styles.module.css';

/**
 * Componente de la página ResetPassword.
 * - Sin token: muestra mensaje de enlace inválido.
 * - Reset exitoso: muestra Result con botón a login.
 * - Por defecto: formulario para ingresar nueva contraseña con validaciones
 *   (mín. 8 caracteres, mayúscula, minúscula, número y símbolo).
 */
export default function ResetPasswordPage() {
  const { loading, success, onFinish, hasToken } = useResetPassword();

  if (!hasToken) {
    return (
      <div className={styles.container}>
        <LoginBackground />
        <Card className={styles.card}>
          <Typography.Title level={4} className={styles.title}>
            Enlace inválido
          </Typography.Title>
          <Typography.Text type="secondary">
            No se encontró un token de recuperación. Solicita uno nuevo en "¿Olvidaste tu contraseña?".
          </Typography.Text>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.container}>
        <LoginBackground />
        <Card className={styles.card}>
          <Result
            status="success"
            title="Contraseña actualizada"
            subTitle="Tu contraseña se ha restablecido correctamente."
            extra={[
              <Button type="primary" onClick={() => window.location.href = '/login'}>
                Ir al inicio de sesión
              </Button>,
            ]}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <LoginBackground />
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
                message: 'Debe tener mayúscula, minúscula, número y símbolo',
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
