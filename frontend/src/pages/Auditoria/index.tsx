/**
 * @file Página de auditoría.
 * Muestra el registro de todas las acciones realizadas en el sistema
 * con paginación, colores por tipo de acción, formato de fecha local
 * y filtros por rango de fechas.
 */

import { Table, Tag, Typography, Space, DatePicker, Button } from 'antd';
import { useAuditoria } from './useAuditoria';
import styles from './styles.module.css';
import dayjs from 'dayjs';

const actionColors: Record<string, string> = {
  'Creó': 'green',
  'Editó': 'blue',
  'Eliminó': 'red',
  'Registró': 'purple',
  'Se registró': 'orange',
};

const { RangePicker } = DatePicker;

/**
 * Componente de la página Auditoría.
 * Renderiza una tabla paginada con columnas: Fecha, Usuario, Acción
 * (con Tag coloreado según el tipo), Entidad y Detalle.
 * Incluye filtros por rango de fechas.
 */
export default function AuditoriaPage() {
  const { data, isLoading, page, setPage, limit, fechaDesde, setFechaDesde, fechaHasta, setFechaHasta } = useAuditoria();

  const onFechaChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setFechaDesde(dates[0].format('YYYY-MM-DD'));
      setFechaHasta(dates[1].format('YYYY-MM-DD'));
    } else {
      setFechaDesde('');
      setFechaHasta('');
    }
  };

  const clearFechas = () => {
    setFechaDesde('');
    setFechaHasta('');
  };

  return (
    <div className={styles.page}>
      <Space style={{ width: '100%', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={4} className={styles.title}>Auditoría</Typography.Title>
        <RangePicker
          value={fechaDesde && fechaHasta ? [dayjs(fechaDesde), dayjs(fechaHasta)] : undefined}
          onChange={onFechaChange}
          allowClear
          placeholder={['Fecha inicio', 'Fecha fin']}
          style={{ width: 320 }}
          format="YYYY-MM-DD"
          showTime={false}
          ranges={{
            Hoy: [dayjs(), dayjs()],
            'Últimos 7 días': [dayjs().subtract(6, 'days'), dayjs()],
            'Últimos 30 días': [dayjs().subtract(29, 'days'), dayjs()],
          }}
        />
        {(fechaDesde || fechaHasta) && (
          <Button size="small" type="text" onClick={clearFechas}>
            Limpiar fechas
          </Button>
        )}
      </Space>

      <Table
        dataSource={data?.data ?? []}
        loading={isLoading}
        rowKey="id"
        pagination={{
          current: page,
          pageSize: limit,
          total: data?.meta?.total,
          onChange: (p) => setPage(p),
          showSizeChanger: false,
        }}
        scroll={{ x: 'max-content' }}
        columns={[
          {
            title: 'Fecha',
            dataIndex: 'created_at',
            key: 'fecha',
            width: 180,
            render: (v: string) => new Date(v).toLocaleString('es-CO'),
          },
          { title: 'Usuario', dataIndex: 'usuario_nombre', key: 'usuario', width: 130 },
          {
            title: 'Acción',
            dataIndex: 'accion',
            key: 'accion',
            width: 150,
            render: (v: string) => {
              const key = Object.keys(actionColors).find((k) => v.startsWith(k));
              return <Tag color={key ? actionColors[key] : 'default'}>{v}</Tag>;
            },
          },
          { title: 'Entidad', dataIndex: 'entidad', key: 'entidad', width: 100 },
          { title: 'Detalle', dataIndex: 'detalle', key: 'detalle', ellipsis: true },
        ]}
      />
    </div>
  );
}
