/**
 * @file Página "Olvidé mi contraseña" (Forgot Password).
 * Formulario que solicita el email del usuario para enviar
 * un enlace de recuperación.
 */

import { Form, Input, Button, Card, Typography, Result, Alert } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useForgotPassword } from './useForgotPassword';
import LoginBackground from '../../components/LoginBackground';
import styles from './styles.module.css';

/**
 * Componente de la página ForgotPassword.
 * - Formulario: pide el email y envía la solicitud.
 * - Confirmación: mensaje genérico (no revela si el email existe) con
 *   instrucciones claras para revisar el correo o pedir ayuda al administrador.
 */
export default function ForgotPasswordPage() {
  const { loading, sent, email, onFinish, reset } = useForgotPassword();

  return (
    <div className={styles.container}>
      <LoginBackground />
      <Card className={styles.card}>
        {sent ? (
          <Result
            status="success"
            icon={<MailOutlined style={{ color: '#4fc3f7' }} />}
            title="Solicitud enviada"
            subTitle={
              <>
                Si <strong>{email}</strong> está registrado, recibirás un enlace para
                restablecer tu contraseña. Revisa también la carpeta de spam.
              </>
            }
            extra={[
              <Alert
                key="info"
                type="info"
                showIcon
                style={{ textAlign: 'left', marginBottom: 16 }}
                message="¿No llega el correo?"
                description="El enlace vence en 60 minutos. Si no lo recibes, pide a un administrador que genere uno desde el módulo de Usuarios."
              />,
              <div key="acciones" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link to="/login">
                  <Button type="primary" block size="large">
                    Volver al inicio de sesión
                  </Button>
                </Link>
                <Button type="link" block onClick={reset}>
                  Usar otro correo
                </Button>
              </div>,
            ]}
          />
        ) : (
          <>
            <Typography.Title level={3} className={styles.title}>
              Recuperar contraseña
            </Typography.Title>
            <Typography.Text type="secondary" className={styles.subtitle}>
              Ingresa tu email y te enviaremos un enlace para crear una nueva contraseña
            </Typography.Text>
            <Form layout="vertical" onFinish={onFinish} autoComplete="off">
              <Form.Item
                name="email"
                rules={[
                  { required: true, type: 'email', message: 'Ingresa un email válido' },
                  { max: 100, message: 'Email demasiado largo' },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Email" size="large" autoFocus />
              </Form.Item>
              <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                Enviar enlace
              </Button>
            </Form>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Link to="/login">
                <ArrowLeftOutlined /> Volver al inicio de sesión
              </Link>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
