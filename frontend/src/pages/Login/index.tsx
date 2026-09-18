/**
 * @file Página de inicio de sesión.
 * Formulario de autenticación con validación de email y contraseña,
 * enlaces a registro y recuperación de contraseña.
 */

import { Form, Input, Button, Card, Typography } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useLogin } from './useLogin';
import LoginBackground from '../../components/LoginBackground';
import styles from './styles.module.css';

/**
 * Componente de la página Login.
 * Renderiza una tarjeta centrada con formulario (email + contraseña),
 * botón "Ingresar" con estado de carga, enlace a "Olvidaste tu contraseña"
 * y enlace a registro.
 * Utiliza el hook `useLogin` para manejar el estado y el envío.
 */
export default function LoginPage() {
  const { loading, onFinish } = useLogin();

  return (
    <div className={styles.container}>
      <LoginBackground />
      <Card className={styles.card}>
        <Typography.Title level={3} className={styles.title}>
          JYJGestor
        </Typography.Title>
        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'El email es obligatorio' },
              { type: 'email', message: 'Ingresa un email válido (ej: usuario@correo.com)' },
              { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'El email debe tener un @ y un dominio válido' },
              { pattern: /\S/, message: 'El email no puede contener espacios' },
              { whitespace: true, message: 'El email no puede contener espacios' },
              { max: 100, message: 'El email es demasiado largo' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'La contraseña es obligatoria' },
              { min: 8, message: 'La contraseña debe tener al menos 8 caracteres' },
              { pattern: /\S/, message: 'La contraseña no puede contener espacios' },
              { whitespace: true, message: 'La contraseña no puede contener espacios' },
              {
                pattern: /^(?=.*[a-z])/,
                message: 'Debe contener al menos una minúscula',
              },
              {
                pattern: /^(?=.*[A-Z])/,
                message: 'Debe contener al menos una mayúscula',
              },
              {
                pattern: /^(?=.*\d)/,
                message: 'Debe contener al menos un número',
              },
              {
                pattern: /^(?=.*[@$!%*?&])/,
                message: 'Debe contener al menos un símbolo (@$!%*?&)',
              },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Contraseña" size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            Ingresar
          </Button>
          <div className={styles.forgotLink}>
            <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
          </div>
          <div className={styles.forgotLink}>
            ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
