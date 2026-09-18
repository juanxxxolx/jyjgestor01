/**
 * @file Página "Olvidé mi contraseña" (Forgot Password).
 * Formulario que solicita el email del usuario para enviar
 * un enlace de recuperación.
 */

import { Form, Input, Button, Card, Typography } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useForgotPassword } from './useForgotPassword';
import LoginBackground from '../../components/LoginBackground';
import styles from './styles.module.css';

/**
 * Componente de la página ForgotPassword.
 * Renderiza una tarjeta centrada con instrucciones, campo de email
 * y botón "Enviar" con estado de carga.
 * El hook `useForgotPassword` maneja el envío y la respuesta.
 */
export default function ForgotPasswordPage() {
  const { loading, onFinish } = useForgotPassword();

  return (
    <div className={styles.container}>
      <LoginBackground />
      <Card className={styles.card}>
        <Typography.Title level={3} className={styles.title}>
          Recuperar contraseña
        </Typography.Title>
        <Typography.Text type="secondary" className={styles.subtitle}>
          Ingresa tu email para recibir un enlace de recuperación
        </Typography.Text>
        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Email requerido' }, { max: 100, message: 'Email demasiado largo' }]}>
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
