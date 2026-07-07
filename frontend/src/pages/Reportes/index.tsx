import { useState } from 'react';
import { Card, DatePicker, Table, Typography, Row, Col, Statistic, Select, Space } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { reportesApi } from '../../api/reportes.api';
import dayjs from 'dayjs';
import styles from './styles.module.css';

const { RangePicker } = DatePicker;

export default function ReportesPage() {
  const [fechas, setFechas] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([dayjs().subtract(30, 'day'), dayjs()]);
  const [vista, setVista] = useState('diarias');

  const desde = fechas[0]?.toISOString() || undefined;
  const hasta = fechas[1]?.toISOString() || undefined;

  const { data: diarias, isLoading: ld } = useQuery({
    queryKey: ['rep-diarias', desde, hasta],
    queryFn: () => reportesApi.ventasDiarias(desde, hasta),
    enabled: vista === 'diarias',
  });
  const { data: porFecha, isLoading: lf } = useQuery({
    queryKey: ['rep-fecha', desde, hasta],
    queryFn: () => reportesApi.ventasPorFecha(desde, hasta),
    enabled: vista === 'fecha',
  });
  const { data: porProducto, isLoading: lp } = useQuery({
    queryKey: ['rep-producto', desde, hasta],
    queryFn: () => reportesApi.ventasPorProducto(desde, hasta),
    enabled: vista === 'producto',
  });
  const { data: porCliente, isLoading: lc } = useQuery({
    queryKey: ['rep-cliente', desde, hasta],
    queryFn: () => reportesApi.ventasPorCliente(desde, hasta),
    enabled: vista === 'cliente',
  });

  const loading = ld || lf || lp || lc;

  return (
    <div className={styles.page}>
      <Typography.Title level={4}>Reportes</Typography.Title>

      <Space style={{ marginBottom: 16 }}>
        <RangePicker value={fechas as any} onChange={(v: any) => setFechas(v || [null, null])} />
        <Select value={vista} onChange={setVista} style={{ width: 200 }}
          options={[
            { value: 'diarias', label: 'Ventas diarias' },
            { value: 'fecha', label: 'Ventas por fecha' },
            { value: 'producto', label: 'Ventas por producto' },
            { value: 'cliente', label: 'Ventas por cliente' },
          ]}
        />
      </Space>

      {vista === 'fecha' && porFecha?.data && (
        <>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}><Card><Statistic title="Total ventas" value={porFecha.data.totalVentas} /></Card></Col>
            <Col span={8}><Card><Statistic title="Ingresos" value={`$${Number(porFecha.data.ingresos).toLocaleString('es-CO')}`} /></Card></Col>
            <Col span={8}><Card><Statistic title="Ticket promedio" value={`$${Number(porFecha.data.ticketPromedio).toLocaleString('es-CO')}`} /></Card></Col>
          </Row>
          <Table dataSource={porFecha.data.ventas} loading={loading} rowKey="id_venta" size="small"
            columns={[
              { title: '#', dataIndex: 'id_venta', width: 50 },
              { title: 'Cliente', dataIndex: ['cliente', 'nombre'], render: (v: string) => v || 'Mostrador' },
              { title: 'Total', dataIndex: 'total', render: (v: number) => `$${Number(v).toLocaleString('es-CO')}` },
              { title: 'Estado', dataIndex: 'estado', render: (v: string) => v === 'ANULADA' ? 'Anulada' : 'Completada' },
              { title: 'Fecha', dataIndex: 'created_at', render: (v: string) => new Date(v).toLocaleString('es-CO') },
            ]}
          />
        </>
      )}

      {vista === 'diarias' && diarias?.data && (
        <Card title="Ventas diarias">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={diarias.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#1677ff" radius={[4, 4, 0, 0]} name="Ingresos" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {vista === 'producto' && porProducto?.data && (
        <Table dataSource={porProducto.data} loading={loading} rowKey="referencia" size="small"
          columns={[
            { title: 'Producto', dataIndex: 'nombre' },
            { title: 'Referencia', dataIndex: 'referencia' },
            { title: 'Cantidad vendida', dataIndex: 'cantidad' },
            { title: 'Total', dataIndex: 'total', render: (v: number) => `$${Number(v).toLocaleString('es-CO')}` },
          ]}
        />
      )}

      {vista === 'cliente' && porCliente?.data && (
        <Table dataSource={porCliente.data} loading={loading} rowKey="cliente" size="small"
          columns={[
            { title: 'Cliente', dataIndex: 'cliente' },
            { title: 'Compras', dataIndex: 'cantidad' },
            { title: 'Total gastado', dataIndex: 'total', render: (v: number) => `$${Number(v).toLocaleString('es-CO')}` },
          ]}
        />
      )}
    </div>
  );
}
