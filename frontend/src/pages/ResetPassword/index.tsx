/**
 * @file Página de restablecimiento de contraseña (Reset Password).
 * Permite al usuario establecer una nueva contraseña usando un token
 * de recuperación recibido por correo o entregado por un administrador.
 */

import { Form, Input, Button, Card, Typography, Result, Spin } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useResetPassword } from './useResetPassword';
import LoginBackground from '../../components/LoginBackground';
import styles from './styles.module.css';

/**
 * Componente de la página ResetPassword.
 * - Sin token o token inválido: mensaje claro con enlace para solicitar uno nuevo.
 * - Mientras valida: indicador de carga.
 * - Reset exitoso: Result con botón a login.
 * - Por defecto: formulario con contraseña + confirmación.
 */
export default function ResetPasswordPage() {
  const { loading, success, onFinish, hasToken, validating, tokenInvalid } = useResetPassword();

  if (!hasToken || tokenInvalid) {
    return (
      <div className={styles.container}>
        <LoginBackground />
        <Card className={styles.card}>
          <Result
            status="error"
            title="Enlace inválido o expirado"
            subTitle="Este enlace ya no es válido: puede haber expirado (60 minutos) o ya fue utilizado. Solicita uno nuevo."
            extra={[
              <Link to="/forgot-password" key="solicitar">
                <Button type="primary" size="large">
                  Solicitar nuevo enlace
                </Button>
              </Link>,
              <Link to="/login" key="login">
                <Button type="link">Volver al inicio de sesión</Button>
              </Link>,
            ]}
          />
        </Card>
      </div>
    );
  }

  if (validating) {
    return (
      <div className={styles.container}>
        <LoginBackground />
        <Card className={styles.card}>
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Spin size="large" />
            <Typography.Paragraph style={{ marginTop: 16, color: '#90caf9' }}>
              Verificando enlace...
            </Typography.Paragraph>
          </div>
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
            subTitle="Tu contraseña se ha restablecido correctamente. Ya puedes iniciar sesión con la nueva."
            extra={[
              <Link to="/login" key="login">
                <Button type="primary" size="large">
                  Ir al inicio de sesión
                </Button>
              </Link>,
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
          Crea una contraseña segura para tu cuenta
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
            extra="Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo."
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nueva contraseña" size="large" autoFocus />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Confirma tu contraseña' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve();
                  return Promise.reject(new Error('Las contraseñas no coinciden'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirmar contraseña" size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            Restablecer contraseña
          </Button>
        </Form>
      </Card>
    </div>
  );
}
