/**
 * @file Página de administración de usuarios.
 * Permite listar, crear, editar, aprobar/rechazar y desactivar usuarios.
 * Incluye exportación a Excel.
 */

import { Table, Button, Modal, Form, Input, Select, Switch, Typography, Space, Tag, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DownloadOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useUsuarios } from './useUsuarios';
import { downloadExport } from '../../utils/download';
import styles from './styles.module.css';

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
    createMutation, updateMutation, toggleActivoMutation, deleteMutation,
    openCreate, openEdit, closeModal, onFinish, refetch,
  } = useUsuarios();

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
          {record.activo && (
            <Button size="small" danger icon={<CloseCircleOutlined />} onClick={() => handleToggleActivo(record)}>
              Desactivar
            </Button>
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
          <Button icon={<DownloadOutlined />} onClick={() => downloadExport('/usuarios/export', 'usuarios.xlsx')}>
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
            loading={isLoading}
            pagination={false}
            scroll={{ x: 'max-content' }}
            size="small"
          />
        </div>
      )}

      <Typography.Title level={5}>Usuarios registrados</Typography.Title>
      <Table
        dataSource={activos}
        loading={isLoading}
        rowKey="id_usuario"
        scroll={{ x: 'max-content' }}
        columns={columns}
      />

      <Modal
        title={editing ? 'Editar usuario' : 'Nuevo usuario'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="nombre" label="Nombre" rules={[
            { required: true, message: 'Nombre requerido' },
            { max: 100, message: 'Máximo 100 caracteres' },
            { pattern: /^[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ\s\-']+$/, message: 'Solo se permiten letras, espacios, guiones y apóstrofes' }
          ]}>
            <Input disabled={!!editing} maxLength={100} />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[
            { required: true, message: 'Email requerido' },
            { type: 'email', message: 'Email no válido' },
            { max: 100, message: 'Máximo 100 caracteres' },
            { pattern: /^\S+$/, message: 'El email no debe contener espacios' }
          ]}>
            <Input disabled={!!editing} maxLength={100} />
          </Form.Item>
          {!editing && (
            <Form.Item name="password" label="Contraseña" rules={[
              { required: true, message: 'Contraseña requerida' },
              { min: 8, message: 'Mínimo 8 caracteres' },
              { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/, message: 'Debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo' }
            ]}>
              <Input.Password placeholder="Mín. 8 chars, mayúscula, número y símbolo" />
            </Form.Item>
          )}
          <Form.Item name="id_rol" label="Rol" rules={[{ required: true, message: 'Seleccione un rol' }]}>
            <Select
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
      </Modal>
    </div>
  );
}
