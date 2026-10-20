/**
 * @file Página de administración de clientes.
 * Permite listar, buscar, crear, editar y eliminar clientes,
 * así como registrar abonos a cuenta y consultar el historial
 * de abonos realizados.
 */

import { Table, Button, Input, Modal, Form, InputNumber, Popconfirm, Space, Typography, Tag, Skeleton, Empty, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, DownloadOutlined, DollarOutlined, HistoryOutlined } from '@ant-design/icons';
import type { Cliente } from '../../types';
import { useClientes } from './useClientes';
import { downloadExport } from '../../utils/download';
import { formatCOP } from '../../utils/format';
import styles from './styles.module.css';

/**
 * Empty state personalizado para la tabla de clientes.
 */
const ClientesEmpty = ({ onCreate }: { onCreate: () => void }) => (
  <Empty
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    imageStyle={{ height: 120 }}
    description="No hay clientes registrados"
    style={{ padding: 48, textAlign: 'center' }}
  >
    <Button type="primary" icon={<PlusOutlined />} size="large" onClick={onCreate}>
      Crear primer cliente
    </Button>
  </Empty>
);

/**
 * Skeleton para el modal de cliente (create/edit).
 */
const ClienteModalSkeleton = () => (
  <Form layout="vertical">
    <Skeleton active paragraph={{ rows: 4 }} />
    <Skeleton active paragraph={{ rows: 3 }} />
    <Skeleton active paragraph={{ rows: 3 }} />
    <Skeleton active paragraph={{ rows: 3 }} />
  </Form>
);

/**
 * Skeleton para el modal de abono.
 */
const AbonoModalSkeleton = () => (
  <Form layout="vertical">
    <Skeleton active paragraph={{ rows: 2 }} />
    <Skeleton active paragraph={{ rows: 1 }} />
  </Form>
);

/**
 * Skeleton para el modal de historial.
 */
const HistorialModalSkeleton = () => (
  <Table
    dataSource={[1, 2, 3, 4, 5]}
    columns={[
      { title: 'Fecha', dataIndex: 'fecha', key: 'fecha' },
      { title: 'Monto', dataIndex: 'monto', key: 'monto' },
    ]}
    loading={{ spinning: true, indicator: <Skeleton active /> }}
    pagination={false}
    rowKey="fecha"
  />
);

/**
 * Página principal de Clientes.
 *
 * @component
 * @description Muestra una tabla paginada con búsqueda, columnas de nombre,
 * email, teléfono, dirección, saldo (con tag de color) y acciones
 * (abono, historial, editar, eliminar). Incluye modales para crear/editar
 * cliente, registrar abono y ver historial de abonos.
 *
 * @returns {JSX.Element} Vista completa de clientes.
 */
export default function ClientesPage() {
  const {
    data, isLoading, search, setSearch,
    modalOpen, editing, form,
    page, setPage, limit,
    createMutation, updateMutation, deleteMutation,
    openCreate, openEdit, closeModal, onFinish,
    abonoModalOpen, abonoCliente, abonoForm, abonoMutation,
    openAbono, onAbonoFinish, closeAbono,
    historialOpen, historialAbonos,
    openHistorial, closeHistorial,
  } = useClientes();

  const hasData = (data?.data?.length ?? 0) > 0;

  return (
    <div className={styles.page}>
      <Space className={styles.header}>
        <Typography.Title level={4} className={styles.title}>Clientes</Typography.Title>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={() => { downloadExport('/clientes/export', 'clientes.xlsx'); message.success('Exportado'); }}>
            Exportar
          </Button>
          <Input.Search
            prefix={<SearchOutlined />}
            placeholder="Buscar por nombre, email o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={(e) => setSearch((e.target as HTMLInputElement).value)}
            enterButton
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Nuevo cliente
          </Button>
        </Space>
      </Space>

      <Table
        dataSource={data?.data ?? []}
        loading={{ spinning: isLoading, indicator: <Skeleton active /> }}
        rowKey="id_cliente"
        locale={{ emptyText: hasData ? '' : 'No hay clientes' }}
        scroll={{ x: 'max-content' }}
        pagination={{
          current: page,
          pageSize: limit,
          total: data?.meta?.total,
          onChange: (p) => setPage(p),
          showSizeChanger: false,
        }}
        columns={[
          { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
          { title: 'Email', dataIndex: 'email', key: 'email' },
          { title: 'Teléfono', dataIndex: 'telefono', key: 'telefono' },
          { title: 'Dirección', dataIndex: 'direccion', key: 'direccion', ellipsis: true },
          {
            title: 'Saldo',
            dataIndex: 'saldo',
            key: 'saldo',
            render: (v: number) => {
              const saldo = Number(v ?? 0);
              return (
                <Tag color={saldo > 0 ? 'orange' : 'green'}>
                  {formatCOP(saldo)}
                </Tag>
              );
            },
          },
          {
            title: 'Acciones',
            key: 'acciones',
            render: (_: any, record: Cliente) => (
              <Space>
                <Button size="small" icon={<DollarOutlined />} onClick={() => openAbono(record)} title="Registrar abono" />
                <Button size="small" icon={<HistoryOutlined />} onClick={() => openHistorial(record)} title="Historial de abonos" />
                <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
                <Popconfirm title="¿Eliminar cliente?" onConfirm={() => deleteMutation.mutate(record.id_cliente)}>
                  <Button size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      {!isLoading && !hasData && (
        <ClientesEmpty onCreate={openCreate} />
      )}

      {/* Modal Crear/Editar Cliente */}
      <Modal
        title={editing ? 'Editar cliente' : 'Nuevo cliente'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnClose
        width={500}
      >
        {createMutation.isPending || updateMutation.isPending ? (
          <ClienteModalSkeleton />
        ) : (
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="nombre"
              label="Nombre *"
              rules={[
                { required: true, message: 'El nombre es obligatorio' },
                { max: 200, message: 'Máximo 200 caracteres' },
                { pattern: /^[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ\s\-']+$/, message: 'Solo se permiten letras, espacios, guiones y apóstrofes' },
                { validator: (_: any, value: string) => { if (!value || !value.trim()) return Promise.reject(new Error('El nombre no puede estar vacío ni contener solo espacios')); return Promise.resolve(); } }
              ]}
            >
              <Input maxLength={200} placeholder="Ej: Juan Pérez García" />
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
              <Input maxLength={100} placeholder="Ej: juan@email.com" />
            </Form.Item>
            <Form.Item
              name="telefono"
              label="Teléfono *"
              rules={[
                { required: true, message: 'El teléfono es obligatorio' },
                { min: 10, max: 10, message: 'El teléfono debe tener exactamente 10 dígitos' },
                { pattern: /^[0-9]{10}$/, message: 'El teléfono debe contener solo 10 dígitos numéricos' }
              ]}
            >
              <Input maxLength={10} placeholder="Ej: 3104567890" />
            </Form.Item>
            <Form.Item
              name="direccion"
              label="Dirección *"
              rules={[
                { required: true, message: 'La dirección es obligatoria' },
                { max: 300, message: 'Máximo 300 caracteres' },
                { validator: (_: any, value: string) => { if (!value || !value.trim()) return Promise.reject(new Error('La dirección no puede estar vacía ni contener solo espacios')); return Promise.resolve(); } }
              ]}
            >
              <Input.TextArea rows={2} maxLength={300} placeholder="Ej: Calle 123 #45-67, Barrio Centro" />
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Modal Registrar Abono */}
      <Modal
        title={abonoCliente ? `Registrar abono - ${abonoCliente.nombre}` : 'Registrar abono'}
        open={abonoModalOpen}
        onCancel={closeAbono}
        onOk={() => abonoForm.submit()}
        confirmLoading={abonoMutation.isPending}
        destroyOnClose
        width={450}
      >
        {abonoMutation.isPending ? (
          <AbonoModalSkeleton />
        ) : (
          <>
            <Typography.Text>Saldo actual: <strong>{formatCOP(abonoCliente?.saldo ?? 0)}</strong></Typography.Text>
            <Form form={abonoForm} layout="vertical" onFinish={onAbonoFinish} style={{ marginTop: 16 }}>
              <Form.Item
                name="monto"
                label="Monto del abono"
                rules={[{ required: true, message: 'Ingrese el monto' }, { type: 'number', min: 1, message: 'Debe ser mayor a 0' }]}
              >
                <InputNumber min={1} max={999999999} style={{ width: '100%' }} placeholder="0" />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>

      {/* Modal Historial de Abonos */}
      <Modal
        title={abonoCliente ? `Historial de abonos - ${abonoCliente.nombre}` : 'Historial de abonos'}
        open={historialOpen}
        onCancel={closeHistorial}
        footer={null}
        destroyOnClose
        width={500}
      >
        {historialAbonos === undefined ? (
          <HistorialModalSkeleton />
        ) : (
          <Table
            dataSource={historialAbonos}
            rowKey="id_abono"
            pagination={false}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: 'No hay abonos registrados' }}
            columns={[
              {
                title: 'Fecha',
                dataIndex: 'created_at',
                key: 'fecha',
                render: (v: string) => new Date(v).toLocaleString('es-CO'),
              },
              {
                title: 'Monto',
                dataIndex: 'monto',
                key: 'monto',
                render: (v: number) => formatCOP(v),
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
}