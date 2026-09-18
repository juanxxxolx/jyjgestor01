/**
 * @file Página de administración de clientes.
 * Permite listar, buscar, crear, editar y eliminar clientes,
 * así como registrar abonos a cuenta y consultar el historial
 * de abonos realizados.
 */

import { Table, Button, Input, Modal, Form, InputNumber, Popconfirm, Space, Typography, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, DownloadOutlined, DollarOutlined, HistoryOutlined } from '@ant-design/icons';
import type { Cliente } from '../../types';
import { useClientes } from './useClientes';
import { downloadExport } from '../../utils/download';
import styles from './styles.module.css';

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

  return (
    <div className={styles.page}>
      <Space className={styles.header}>
        <Typography.Title level={4} className={styles.title}>Clientes</Typography.Title>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={() => downloadExport('/clientes/export', 'clientes.xlsx')}>
            Exportar
          </Button>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Nuevo cliente
          </Button>
        </Space>
      </Space>

      <Table
        dataSource={data?.data ?? []}
        loading={isLoading}
        rowKey="id_cliente"
        locale={{ emptyText: 'No hay clientes' }}
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
                  ${saldo.toLocaleString('es-CO')}
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

      <Modal
        title={editing ? 'Editar cliente' : 'Nuevo cliente'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="nombre" label="Nombre" rules={[
            { required: true, message: 'Nombre requerido' },
            { max: 200, message: 'Máximo 200 caracteres' },
            { pattern: /^[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ\s\-']+$/, message: 'Solo se permiten letras, espacios, guiones y apóstrofes' }
          ]}>
            <Input maxLength={200} />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[
            { type: 'email', message: 'Email no válido' },
            { max: 100, message: 'Máximo 100 caracteres' },
            { pattern: /^\S+$/, message: 'El email no debe contener espacios' }
          ]}>
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item name="telefono" label="Teléfono" rules={[
            { max: 20, message: 'Máximo 20 caracteres' },
            { pattern: /^[0-9\s\-\+\(\)]+$/, message: 'Solo se permiten números, espacios, guiones, paréntesis y +' }
          ]}>
            <Input maxLength={20} />
          </Form.Item>
          <Form.Item name="direccion" label="Dirección" rules={[
            { max: 300, message: 'Máximo 300 caracteres' },
            { pattern: /^[a-zA-Z0-9áéíóúñüÁÉÍÓÚÑÜ\s\-\.#]+$/, message: 'Caracteres no permitidos en la dirección' }
          ]}>
            <Input.TextArea rows={2} maxLength={300} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={abonoCliente ? `Registrar abono - ${abonoCliente.nombre}` : 'Registrar abono'}
        open={abonoModalOpen}
        onCancel={closeAbono}
        onOk={() => abonoForm.submit()}
        confirmLoading={abonoMutation.isPending}
        destroyOnClose
      >
        <Typography.Text>Saldo actual: <strong>${Number(abonoCliente?.saldo ?? 0).toLocaleString('es-CO')}</strong></Typography.Text>
        <Form form={abonoForm} layout="vertical" onFinish={onAbonoFinish} style={{ marginTop: 16 }}>
          <Form.Item name="monto" label="Monto del abono" rules={[{ required: true, message: 'Ingrese el monto' }, { type: 'number', min: 1, message: 'Debe ser mayor a 0' }]}>
            <InputNumber min={1} max={999999999} prefix="$" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={abonoCliente ? `Historial de abonos - ${abonoCliente.nombre}` : 'Historial de abonos'}
        open={historialOpen}
        onCancel={closeHistorial}
        footer={null}
        destroyOnClose
      >
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
              render: (v: number) => `$${Number(v).toLocaleString('es-CO')}`,
            },
          ]}
        />
      </Modal>
    </div>
  );
}
