import { useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Tag, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { movimientosApi } from '../../api/movimientos.api';
import { productosApi } from '../../api/productos.api';
import type { Movimiento } from '../../types';

export default function ExistenciasPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const qc = useQueryClient();

  const { data: movimientosRes, isLoading } = useQuery({
    queryKey: ['movimientos'],
    queryFn: () => movimientosApi.getAll(),
  });

  const { data: productosRes } = useQuery({ queryKey: ['productos'], queryFn: productosApi.getAll });

  const createMutation = useMutation({
    mutationFn: movimientosApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['movimientos'] });
      qc.invalidateQueries({ queryKey: ['productos'] });
      setModalOpen(false);
      form.resetFields();
      message.success('Movimiento registrado');
    },
    onError: (e: any) => message.error(e.response?.data?.message || 'Error al registrar'),
  });

  const tipoColor: Record<string, string> = { ENTRADA: 'green', SALIDA: 'red', AJUSTE: 'blue' };

  return (
    <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>Existencias / Movimientos</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          Registrar movimiento
        </Button>
      </Space>

      <Table
        dataSource={movimientosRes?.data ?? []}
        loading={isLoading}
        rowKey="id_movimiento"
        columns={[
          { title: 'Producto', dataIndex: ['producto', 'nombre'], key: 'producto' },
          { title: 'Referencia', dataIndex: ['producto', 'referencia'], key: 'referencia' },
          {
            title: 'Tipo',
            dataIndex: 'tipo_movimiento',
            key: 'tipo',
            render: (v: string) => <Tag color={tipoColor[v]}>{v}</Tag>,
          },
          { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad' },
          { title: 'Motivo', dataIndex: 'motivo', key: 'motivo', ellipsis: true },
          { title: 'Usuario', dataIndex: ['usuario', 'nombre'], key: 'usuario' },
          {
            title: 'Fecha',
            dataIndex: 'fecha_movimiento',
            key: 'fecha',
            render: (v: string) => new Date(v).toLocaleString('es-CO'),
          },
        ]}
      />

      <Modal
        title="Registrar movimiento"
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={(v) => createMutation.mutate(v)}>
          <Form.Item name="id_producto" label="Producto" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={(productosRes?.data ?? []).map((p: any) => ({
                value: p.id_producto,
                label: `${p.nombre} (${p.referencia}) — Stock: ${p.stock}`,
              }))}
            />
          </Form.Item>
          <Form.Item name="tipo_movimiento" label="Tipo" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'ENTRADA', label: 'Entrada' },
                { value: 'SALIDA', label: 'Salida' },
                { value: 'AJUSTE', label: 'Ajuste (establece stock)' },
              ]}
            />
          </Form.Item>
          <Form.Item name="cantidad" label="Cantidad" rules={[{ required: true }]}>
            <InputNumber min={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="motivo" label="Motivo" rules={[{ required: true }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
