/**
 * @file Página de registro de usuario (Registro).
 * Formulario para crear una cuenta nueva. Tras el registro exitoso,
 * muestra un mensaje indicando que la cuenta está pendiente de aprobación.
 */

import { Form, Input, Button, Card, Typography, Result } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useRegistro } from './useRegistro';
import LoginBackground from '../../components/LoginBackground';
import styles from './styles.module.css';

/**
 * Componente de la página Registro.
 * - Estado `success`: muestra Result con mensaje de aprobación pendiente y botón a login.
 * - Estado por defecto: formulario con nombre, email y contraseña
 *   (con validaciones de formato y seguridad), y enlace a inicio de sesión.
 */
export default function RegistroPage() {
  const { loading, success, onFinish } = useRegistro();

  if (success) {
    return (
      <div className={styles.container}>
        <LoginBackground />
        <Card className={styles.card}>
          <Result
            status="success"
            title="Registro exitoso"
            subTitle="Tu cuenta está pendiente de aprobación. Un administrador la activará pronto."
            extra={[
              <Link to="/login"><Button type="primary">Ir al inicio de sesión</Button></Link>,
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
          Crear cuenta
        </Typography.Title>
        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item name="nombre" rules={[
            { required: true, message: 'El nombre es obligatorio' },
            { min: 3, message: 'El nombre debe tener al menos 3 caracteres' },
            { max: 100, message: 'El nombre es demasiado largo' },
            { whitespace: true, message: 'El nombre no puede ser solo espacios' },
            { pattern: /^[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ\s\-']+$/, message: 'Solo se permiten letras, espacios, guiones y apóstrofes' },
          ]}>
            <Input prefix={<UserOutlined />} placeholder="Nombre completo" size="large" />
          </Form.Item>
          <Form.Item name="email" rules={[
            { required: true, message: 'El email es obligatorio' },
            { type: 'email', message: 'Ingresa un email válido (ej: usuario@correo.com)' },
            { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'El email debe tener un @ y un dominio válido' },
            { whitespace: true, message: 'El email no puede contener espacios' },
            { max: 100, message: 'El email es demasiado largo' },
          ]}>
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'La contraseña es obligatoria' },
              { min: 8, message: 'La contraseña debe tener al menos 8 caracteres' },
              { whitespace: true, message: 'La contraseña no puede contener espacios' },
              { pattern: /^(?=.*[a-z])/, message: 'Debe contener al menos una minúscula' },
              { pattern: /^(?=.*[A-Z])/, message: 'Debe contener al menos una mayúscula' },
              { pattern: /^(?=.*\d)/, message: 'Debe contener al menos un número' },
              { pattern: /^(?=.*[@$!%*?&])/, message: 'Debe contener al menos un símbolo (@$!%*?&)' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Contraseña" size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            Registrarme
          </Button>
          <div className={styles.link}>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
