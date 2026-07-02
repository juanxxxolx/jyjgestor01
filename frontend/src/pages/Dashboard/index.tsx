import { Row, Col, Card, Statistic, Table, Tag, Alert, Typography } from 'antd';
import { ShoppingCartOutlined, TeamOutlined, WarningOutlined, SwapOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { productosApi } from '../../api/productos.api';
import { clientesApi } from '../../api/clientes.api';
import { movimientosApi } from '../../api/movimientos.api';
import type { Producto, Movimiento } from '../../types';

export default function DashboardPage() {
  const { data: productosRes } = useQuery({ queryKey: ['productos'], queryFn: () => productosApi.getAll() });
  const { data: clientesRes } = useQuery({ queryKey: ['clientes'], queryFn: () => clientesApi.getAll() });
  const { data: movimientosRes } = useQuery({ queryKey: ['movimientos'], queryFn: () => movimientosApi.getAll() });

  const productos: Producto[] = productosRes?.data ?? [];
  const clientes = clientesRes?.data ?? [];
  const movimientos: Movimiento[] = movimientosRes?.data ?? [];

  const bajoStock = productos.filter((p) => p.stock <= p.stock_minimo);

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={4} style={{ marginBottom: 24 }}>
        Panel General
      </Typography.Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title="Productos" value={productos.length} prefix={<ShoppingCartOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title="Clientes" value={clientes.length} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic
              title="Bajo stock"
              value={bajoStock.length}
              prefix={<WarningOutlined />}
              valueStyle={{ color: bajoStock.length > 0 ? '#cf1322' : undefined }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title="Movimientos" value={movimientos.length} prefix={<SwapOutlined />} />
          </Card>
        </Col>
      </Row>

      {bajoStock.length > 0 && (
        <Alert
          style={{ marginTop: 24 }}
          type="warning"
          showIcon
          message={`${bajoStock.length} producto(s) con stock bajo o agotado`}
          description={bajoStock.map((p) => p.nombre).join(', ')}
        />
      )}

      <Card style={{ marginTop: 24 }} title="Últimos movimientos">
        <Table
          dataSource={movimientos.slice(0, 10)}
          rowKey="id_movimiento"
          size="small"
          pagination={false}
          columns={[
            { title: 'Producto', dataIndex: ['producto', 'nombre'], key: 'producto' },
            {
              title: 'Tipo',
              dataIndex: 'tipo_movimiento',
              key: 'tipo',
              render: (v: string) => (
                <Tag color={v === 'ENTRADA' ? 'green' : v === 'SALIDA' ? 'red' : 'blue'}>{v}</Tag>
              ),
            },
            { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad' },
            { title: 'Motivo', dataIndex: 'motivo', key: 'motivo' },
            {
              title: 'Fecha',
              dataIndex: 'fecha_movimiento',
              key: 'fecha',
              render: (v: string) => new Date(v).toLocaleDateString('es-CO'),
            },
          ]}
        />
      </Card>
    </div>
  );
}
