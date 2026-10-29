/**
 * @file Página de administración de usuarios.
 * Permite listar, crear, editar, aprobar/rechazar y desactivar usuarios.
 * Incluye exportación a Excel.
 */

import { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Switch, Typography, Space, Tag, message, Popconfirm, Skeleton, Empty, Alert, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DownloadOutlined, CheckCircleOutlined, CloseCircleOutlined, KeyOutlined, CopyOutlined, LinkOutlined } from '@ant-design/icons';
import { useUsuarios } from './useUsuarios';
import { downloadExport } from '../../utils/download';
import styles from './styles.module.css';

const UsuariosEmpty = () => (
  <Empty
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    imageStyle={{ height: 120 }}
    description="No hay usuarios registrados"
    style={{ padding: 48, textAlign: 'center' }}
  >
    <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => window.location.href = '/usuarios'}>
      Crear primer usuario
    </Button>
  </Empty>
);

/**
 * Componente de la página Usuarios.
 * - Sección de usuarios pendientes de aprobación (con botones Aprobar / Rechazar).
 * - Tabla de usuarios activos con acciones de editar y desactivar.
 * - Modal para crear o editar usuarios (formulario con nombre, email, contraseña, rol, activo).
 * - Botón de exportación a Excel.
 */
export default function UsuariosPage() {
  const {
    data, isLoading, modalOpen, editing, form, rolLabel,
    createMutation, updateMutation, toggleActivoMutation, deleteMutation, resetPasswordMutation,
    openCreate, openEdit, closeModal, onFinish, refetch,
  } = useUsuarios();

  const [resetInfo, setResetInfo] = useState<any>(null);
  const [resetLoadingId, setResetLoadingId] = useState<number | null>(null);

  const pendientes = (data?.data ?? []).filter((u: any) => !u.activo);
  const activos = (data?.data ?? []).filter((u: any) => u.activo);

  const handleToggleActivo = async (user: any) => {
    const nuevoEstado = !user.activo;
    await toggleActivoMutation.mutateAsync({ id: user.id_usuario, activo: nuevoEstado });
    message.success(`Usuario ${nuevoEstado ? 'aprobado' : 'desactivado'}`);
    refetch();
  };

  const handleRechazar = async (user: any) => {
    await deleteMutation.mutateAsync(user.id_usuario);
    message.success(`Usuario ${user.nombre} rechazado`);
    refetch();
  };

  const handleResetPassword = async (user: any) => {
    setResetLoadingId(user.id_usuario);
    try {
      const res = await resetPasswordMutation.mutateAsync(user.id_usuario);
      setResetInfo(res.data);
    } catch {
      // El interceptor global de Axios ya muestra el mensaje de error
    } finally {
      setResetLoadingId(null);
    }
  };

  const handleCopyLink = async () => {
    if (!resetInfo?.link) return;
    try {
      await navigator.clipboard.writeText(resetInfo.link);
      message.success('Enlace copiado');
    } catch {
      message.warning('No se pudo copiar automáticamente. Selecciona el enlace y cópialo manualmente.');
    }
  };

  const pendientesColumns = [
    { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Acciones', key: 'acciones',
      render: (_: any, r: any) => (
        <Space>
          <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => handleToggleActivo(r)}>
            Aprobar
          </Button>
          <Popconfirm title={`¿Rechazar a ${r.nombre}? Se eliminará su cuenta.`} onConfirm={() => handleRechazar(r)} okText="Sí, rechazar" cancelText="Cancelar">
            <Button size="small" danger icon={<CloseCircleOutlined />}>
              Rechazar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const columns = [
    { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Rol', dataIndex: 'id_rol', key: 'rol', render: (v: number) => rolLabel[v] ?? v },
    {
      title: 'Activo', dataIndex: 'activo', key: 'activo',
      render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'Sí' : 'No'}</Tag>,
    },
    {
      title: 'Acciones', key: 'acciones',
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Tooltip title="Restablecer contraseña">
            <Button
              size="small"
              icon={<KeyOutlined />}
              loading={resetLoadingId === record.id_usuario}
              onClick={() => handleResetPassword(record)}
            />
          </Tooltip>
          {record.activo && (
            <Popconfirm title="¿Desactivar usuario?" onConfirm={() => handleToggleActivo(record)} okText="Sí" cancelText="Cancelar">
              <Button size="small" danger icon={<CloseCircleOutlined />}>Desactivar</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <Space className={styles.header}>
        <Typography.Title level={4} className={styles.title}>Usuarios</Typography.Title>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={() => { downloadExport('/usuarios/export', 'usuarios.xlsx'); message.success('Exportado'); }}>
            Exportar
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Nuevo usuario
          </Button>
        </Space>
      </Space>

      {pendientes.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <Typography.Title level={5}>
            <Tag color="orange">{pendientes.length}</Tag> Pendientes de aprobación
          </Typography.Title>
          <Table
            dataSource={pendientes}
            columns={pendientesColumns}
            rowKey="id_usuario"
            loading={{ spinning: isLoading, indicator: <Skeleton active /> }}
            pagination={false}
            scroll={{ x: 'max-content' }}
            size="small"
            locale={{ emptyText: 'Sin pendientes' }}
          />
        </div>
      )}

      <Typography.Title level={5}>Usuarios registrados</Typography.Title>
      {!isLoading && activos.length === 0 ? (
        <UsuariosEmpty />
      ) : (
        <Table
          dataSource={activos}
          loading={{ spinning: isLoading, indicator: <Skeleton active /> }}
          rowKey="id_usuario"
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: 'No hay usuarios registrados' }}
          columns={columns}
        />
      )}

      <Modal
        title={editing ? 'Editar usuario' : 'Nuevo usuario'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnHidden
        width={500}
      >
        {createMutation.isPending || updateMutation.isPending ? (
          <Form layout="vertical">
            <Skeleton active paragraph={{ rows: 5 }} />
          </Form>
        ) : (
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="nombre"
              label="Nombre *"
              rules={[
                { required: true, message: 'El nombre es obligatorio' },
                { max: 100, message: 'Máximo 100 caracteres' },
                { pattern: /^[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ\s\-']+$/, message: 'Solo se permiten letras, espacios, guiones y apóstrofes' }
              ]}
            >
              <Input disabled={!!editing} maxLength={100} placeholder="Ej: Juan Pérez García" />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email *"
              rules={[
                { required: true, message: 'El email es obligatorio' },
                { type: 'email', message: 'Email no válido' },
                { max: 100, message: 'Máximo 100 caracteres' },
                { pattern: /^\S+$/, message: 'El email no debe contener espacios' }
              ]}
            >
              <Input disabled={!!editing} maxLength={100} placeholder="Ej: juan@empresa.com" />
            </Form.Item>
            {!editing && (
              <Form.Item
                name="password"
                label="Contraseña *"
                rules={[
                  { required: true, message: 'La contraseña es obligatoria' },
                  { min: 8, message: 'Mínimo 8 caracteres' },
                  { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/, message: 'Mín. 8 chars, mayúscula, minúscula, número y símbolo' }
                ]}
              >
                <Input.Password placeholder="Mín. 8 chars, mayúscula, minúscula, número y símbolo" />
              </Form.Item>
            )}
            <Form.Item
              name="id_rol"
              label="Rol *"
              rules={[{ required: true, message: 'Seleccione un rol' }]}
            >
              <Select
                placeholder="Seleccionar rol"
                options={[
                  { value: 1, label: 'Admin' },
                  { value: 2, label: 'Usuario' },
                  { value: 3, label: 'Invitado' },
                ]}
              />
            </Form.Item>
            {editing && (
              <Form.Item name="activo" label="Activo" valuePropName="checked">
                <Switch />
              </Form.Item>
            )}
          </Form>
        )}
      </Modal>

      <Modal
        title="Enlace de recuperación"
        open={!!resetInfo}
        onCancel={() => setResetInfo(null)}
        width={560}
        destroyOnHidden
        footer={[
          <Button key="cerrar" onClick={() => setResetInfo(null)}>Cerrar</Button>,
          <Button
            key="abrir"
            icon={<LinkOutlined />}
            onClick={() => resetInfo?.link && window.open(resetInfo.link, '_blank', 'noopener')}
          >
            Abrir enlace
          </Button>,
          <Button key="copiar" type="primary" icon={<CopyOutlined />} onClick={handleCopyLink}>
            Copiar enlace
          </Button>,
        ]}
      >
        {resetInfo && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Alert
              type={resetInfo.email_enviado ? 'success' : 'info'}
              showIcon
              message={
                resetInfo.email_enviado
                  ? `Enlace enviado a ${resetInfo.email}`
                  : 'Enlace generado correctamente'
              }
              description={
                resetInfo.email_enviado
                  ? 'El usuario recibirá un correo con las instrucciones. También puedes compartir el enlace manualmente.'
                  : resetInfo.email_configurado
                    ? 'No se pudo enviar el correo automáticamente. Copia el enlace y compártelo con el usuario.'
                    : 'El envío automático de correos no está configurado. Copia el enlace y compártelo por WhatsApp o correo.'
              }
            />

            <div>
              <Typography.Text strong>Enlace de un solo uso</Typography.Text>
              <Input.TextArea
                value={resetInfo.link}
                readOnly
                autoSize={{ minRows: 2, maxRows: 4 }}
                style={{ marginTop: 8 }}
                onFocus={(e) => e.currentTarget.select()}
              />
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Vence el {new Date(resetInfo.expires_at).toLocaleString('es-CO')} y solo puede usarse una vez.
              </Typography.Text>
            </div>

            <Alert
              type="warning"
              showIcon
              message="Compártelo solo con el usuario"
              description="Cualquier persona que tenga este enlace podrá cambiar la contraseña de esa cuenta."
            />
          </Space>
        )}
      </Modal>
    </div>
  );
}