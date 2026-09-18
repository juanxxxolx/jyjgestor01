/**
 * @file Página de arqueo de caja.
 * Permite visualizar el estado del día (ventas en efectivo, cantidad
 * de ventas), realizar o actualizar el cierre del día declarando el
 * efectivo en caja, y consultar el historial de cierres anteriores.
 */

import { useState } from 'react';
import { Table, Button, Card, Typography, Modal, InputNumber, Space, Tag, Descriptions, message } from 'antd';
import { DollarOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useCierresCaja } from './useCierresCaja';
import styles from './styles.module.css';

/**
 * Página principal de Arqueo de Caja.
 *
 * @component
 * @description Muestra una tarjeta con el resumen del día (total ventas
 * efectivo, cantidad de ventas, estado del cierre) y un botón para
 * realizar/actualizar el cierre. Incluye una tabla con el historial de
 * cierres paginado y un modal para ingresar el efectivo declarado con
 * cálculo de diferencia estimada.
 *
 * @returns {JSX.Element} Vista de arqueo de caja.
 */
export default function CierresCajaPage() {
  const { cierresRes, isLoading, hoyRes, createMutation, page, setPage, limit } = useCierresCaja();
  const [modalOpen, setModalOpen] = useState(false);
  const [efectivoDeclarado, setEfectivoDeclarado] = useState<number>(0);

  const hoy = hoyRes?.data;
  const yaHayCierre = hoy?.cierre_hoy !== null;

  const handleCerrar = async () => {
    if (efectivoDeclarado <= 0) { message.warning('Ingrese el efectivo declarado'); return; }
    await createMutation.mutateAsync({ efectivo_declarado: efectivoDeclarado });
    message.success('Cierre registrado');
    setModalOpen(false);
    setEfectivoDeclarado(0);
  };

  const columns = [
    { title: '#', dataIndex: 'id_cierre', key: 'id_cierre', width: 60 },
    { title: 'Fecha', dataIndex: 'created_at', key: 'created_at', render: (v: string) => new Date(v).toLocaleString('es-CO'), width: 160 },
    { title: 'Total ventas', dataIndex: 'total_ventas', key: 'total_ventas', render: (v: number) => `$${Number(v).toFixed(2)}`, width: 120 },
    { title: 'Efectivo declarado', dataIndex: 'efectivo_declarado', key: 'efectivo_declarado', render: (v: number) => `$${Number(v).toFixed(2)}`, width: 150 },
    {
      title: 'Diferencia', dataIndex: 'diferencia', key: 'diferencia',
      render: (v: number) => {
        const val = Number(v);
        return <Tag color={val === 0 ? 'green' : val > 0 ? 'blue' : 'red'}>{val === 0 ? 'Cero' : val > 0 ? `+$${val.toFixed(2)}` : `-$${Math.abs(val).toFixed(2)}`}</Tag>;
      },
      width: 120,
    },
    { title: 'Observación', dataIndex: 'observacion', key: 'observacion', ellipsis: true },
    { title: 'Creado por', dataIndex: 'usuario', key: 'usuario', render: (u: any) => u?.nombre, width: 150 },
  ];

  return (
    <div className={styles.page}>
      <Typography.Title level={4}><SafetyCertificateOutlined /> Arqueo de Caja</Typography.Title>

      {hoy && (
        <Card title="Estado de hoy" style={{ marginBottom: 16 }}>
          <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="Ventas en efectivo hoy">${Number(hoy.total_ventas_hoy).toFixed(2)} ({hoy.cantidad_ventas} ventas)</Descriptions.Item>
            {yaHayCierre ? (
              <>
                <Descriptions.Item label="Efectivo declarado">${Number(hoy.cierre_hoy.efectivo_declarado).toFixed(2)}</Descriptions.Item>
                <Descriptions.Item label="Diferencia">
                  <Tag color={Number(hoy.cierre_hoy.diferencia) === 0 ? 'green' : 'red'}>
                    {Number(hoy.cierre_hoy.diferencia) === 0 ? 'Cuadra' : `$${Number(hoy.cierre_hoy.diferencia).toFixed(2)}`}
                  </Tag>
                </Descriptions.Item>
              </>
            ) : (
              <Descriptions.Item label="Estado">Pendiente de cierre</Descriptions.Item>
            )}
          </Descriptions>
          <Button type="primary" icon={<DollarOutlined />} onClick={() => { setEfectivoDeclarado(hoy.total_ventas_hoy); setModalOpen(true); }} style={{ marginTop: 8 }}>
            {yaHayCierre ? 'Actualizar cierre de hoy' : 'Realizar cierre de hoy'}
          </Button>
        </Card>
      )}

      <Card title="Historial de cierres">
        <Table
          dataSource={cierresRes?.data ?? []}
          columns={columns}
          rowKey="id_cierre"
          loading={isLoading}
          pagination={{ current: page, pageSize: limit, total: cierresRes?.total ?? 0, onChange: (p) => setPage(p), showSizeChanger: false }}
          scroll={{ x: 'max-content' }}
          size="small"
        />
      </Card>

      <Modal title="Arqueo de caja" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={handleCerrar} confirmLoading={createMutation.isPending}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Typography.Text>Total ventas en efectivo hoy: <strong>${Number(hoy?.total_ventas_hoy ?? 0).toFixed(2)}</strong></Typography.Text>
          <div>
            <Typography.Text>Efectivo contado en caja:</Typography.Text>
            <InputNumber style={{ width: '100%' }} value={efectivoDeclarado} onChange={(v) => setEfectivoDeclarado(v ?? 0)} min={0} max={999999999} prefix="$" />
          </div>
          {efectivoDeclarado > 0 && (
            <Typography.Text type={efectivoDeclarado - Number(hoy?.total_ventas_hoy ?? 0) === 0 ? 'success' : 'warning'}>
              Diferencia estimada: <strong>${(efectivoDeclarado - Number(hoy?.total_ventas_hoy ?? 0)).toFixed(2)}</strong>
              {efectivoDeclarado - Number(hoy?.total_ventas_hoy ?? 0) === 0 ? ' ✓' : ''}
            </Typography.Text>
          )}
        </Space>
      </Modal>
    </div>
  );
}
