/**
 * @file Página de auditoría.
 * Muestra el registro de todas las acciones realizadas en el sistema
 * con paginación, colores por tipo de acción y formato de fecha local.
 */

import { Table, Tag, Typography, Space } from 'antd';
import { useAuditoria } from './useAuditoria';
import styles from './styles.module.css';

const actionColors: Record<string, string> = {
  'Creó': 'green',
  'Editó': 'blue',
  'Eliminó': 'red',
  'Registró': 'purple',
  'Se registró': 'orange',
};

/**
 * Componente de la página Auditoría.
 * Renderiza una tabla paginada con columnas: Fecha, Usuario, Acción
 * (con Tag coloreado según el tipo), Entidad y Detalle.
 * Los colores de acción se definen en `actionColors`.
 */
export default function AuditoriaPage() {
  const { data, isLoading, page, setPage, limit } = useAuditoria();

  return (
    <div className={styles.page}>
      <Typography.Title level={4} className={styles.title}>Auditoría</Typography.Title>

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
