/**
 * @file Página de reportes y estadísticas de ventas.
 * Permite seleccionar un rango de fechas y visualizar ventas diarias
 * (gráfico de barras), por fecha (tabla con totales), por producto
 * o por cliente.
 */

import { useState } from 'react';
import { Card, DatePicker, Table, Typography, Row, Col, Statistic, Select, Space, Empty, Skeleton } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { reportesApi } from '../../api/reportes.api';
import dayjs from 'dayjs';
import { formatCOP } from '../../utils/format';
import styles from './styles.module.css';

const { RangePicker } = DatePicker;

const ReportesEmpty = () => (
  <Empty
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    imageStyle={{ height: 120 }}
    description="No hay datos para el rango seleccionado"
    style={{ padding: 48, textAlign: 'center' }}
  >
    <Typography.Text type="secondary">
      Intente ampliar el rango de fechas o seleccione otra vista.
    </Typography.Text>
  </Empty>
);

/**
 * Componente de la página Reportes.
 * - Selector de rango de fechas y vista (diarias, por fecha, por producto, por cliente).
 * - Vista "diarias": gráfico de barras con ingresos por día.
 * - Vista "fecha": tarjetas con total ventas, ingresos y ticket promedio + tabla.
 * - Vista "producto": tabla con cantidad vendida y total por producto.
 * - Vista "cliente": tabla con compras y total gastado por cliente.
 * - Cada vista activa su correspondiente `useQuery` mediante `enabled`.
 */
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

  const renderVistaFecha = () => {
    if (!loading && !porFecha?.data) return <ReportesEmpty />;
    if (porFecha?.data) {
      return (
        <>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}><Card><Statistic title="Total ventas" value={porFecha.data.totalVentas} loading={loading} /></Card></Col>
            <Col span={8}><Card><Statistic title="Ingresos" value={formatCOP(porFecha.data.ingresos)} loading={loading} /></Card></Col>
            <Col span={8}><Card><Statistic title="Ticket promedio" value={formatCOP(porFecha.data.ticketPromedio)} loading={loading} /></Card></Col>
          </Row>
          <Table
            dataSource={porFecha.data.ventas ?? []}
            loading={{ spinning: loading, indicator: <Skeleton active /> }}
            rowKey="id_venta"
            size="small"
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: 'No hay ventas en este período' }}
            columns={[
              { title: '#', dataIndex: 'id_venta', width: 50 },
              { title: 'Cliente', dataIndex: ['cliente', 'nombre'], render: (v: string) => v || 'Mostrador' },
              { title: 'Total', dataIndex: 'total', render: (v: number) => formatCOP(v) },
              { title: 'Estado', dataIndex: 'estado', render: (v: string) => v === 'ANULADA' ? 'Anulada' : 'Completada' },
              { title: 'Fecha', dataIndex: 'created_at', render: (v: string) => new Date(v).toLocaleString('es-CO') },
            ]}
          />
        </>
      );
    }
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  };

  const renderVistaDiarias = () => {
    if (!loading && !diarias?.data) return <ReportesEmpty />;
    if (diarias?.data) {
      return (
        <Card title="Ventas diarias">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={diarias.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip formatter={(value: any) => [typeof value === 'number' ? formatCOP(value) : '—', 'Ingresos']} />
              <Bar dataKey="total" fill="#1677ff" radius={[4, 4, 0, 0]} name="Ingresos" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      );
    }
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  };

  const renderVistaProducto = () => {
    if (!loading && !porProducto?.data) return <ReportesEmpty />;
    if (porProducto?.data) {
      return (
        <Table
          dataSource={porProducto.data ?? []}
          loading={{ spinning: loading, indicator: <Skeleton active /> }}
          rowKey="codigo"
          size="small"
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: 'No hay ventas de productos en este período' }}
          columns={[
            { title: 'Producto', dataIndex: 'nombre' },
            { title: 'Código', dataIndex: 'codigo' },
            { title: 'Cantidad vendida', dataIndex: 'cantidad' },
            { title: 'Total', dataIndex: 'total', render: (v: number) => formatCOP(v) },
          ]}
        />
      );
    }
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  };

  const renderVistaCliente = () => {
    if (!loading && !porCliente?.data) return <ReportesEmpty />;
    if (porCliente?.data) {
      return (
        <Table
          dataSource={porCliente.data ?? []}
          loading={{ spinning: loading, indicator: <Skeleton active /> }}
          rowKey="cliente"
          size="small"
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: 'No hay datos de clientes en este período' }}
          columns={[
            { title: 'Cliente', dataIndex: 'cliente' },
            { title: 'Compras', dataIndex: 'cantidad' },
            { title: 'Total gastado', dataIndex: 'total', render: (v: number) => formatCOP(v) },
          ]}
        />
      );
    }
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <Typography.Title level={4}>Reportes</Typography.Title>

      <Space style={{ marginBottom: 16 }}>
        <RangePicker
          value={fechas as any}
          onChange={(v: any) => setFechas(v || [null, null])}
          placeholder={['Fecha inicio', 'Fecha fin']}
          style={{ width: 300 }}
          format="YYYY-MM-DD"
          ranges={{
            Hoy: [dayjs(), dayjs()],
            'Últimos 7 días': [dayjs().subtract(6, 'days'), dayjs()],
            'Últimos 30 días': [dayjs().subtract(29, 'days'), dayjs()],
          }}
        />
        <Select
          value={vista}
          onChange={setVista}
          style={{ width: 200 }}
          placeholder="Seleccionar vista"
          options={[
            { value: 'diarias', label: 'Ventas diarias' },
            { value: 'fecha', label: 'Ventas por fecha' },
            { value: 'producto', label: 'Ventas por producto' },
            { value: 'cliente', label: 'Ventas por cliente' },
          ]}
        />
      </Space>

      {vista === 'fecha' && renderVistaFecha()}
      {vista === 'diarias' && renderVistaDiarias()}
      {vista === 'producto' && renderVistaProducto()}
      {vista === 'cliente' && renderVistaCliente()}
    </div>
  );
}