import { Row, Col, Card, Statistic, Table, Tag, Alert, Typography, Spin, Button } from 'antd';
import { ShoppingCartOutlined, TeamOutlined, WarningOutlined, SwapOutlined, ReloadOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useDashboard } from './useDashboard';
import styles from './styles.module.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF'];

export default function DashboardPage() {
  const { productos, clientes, movimientos, bajoStock, isLoading, isError } = useDashboard();

  if (isLoading) {
    return (
      <div className={styles.page} style={{ textAlign: 'center', paddingTop: 80 }}>
        <Spin size="large" />
        <Typography.Text type="secondary" style={{ display: 'block', marginTop: 16 }}>Cargando panel...</Typography.Text>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.page} style={{ textAlign: 'center', paddingTop: 80 }}>
        <Typography.Text type="danger" style={{ fontSize: 16 }}>Error al cargar los datos</Typography.Text>
        <br />
        <Button icon={<ReloadOutlined />} onClick={() => window.location.reload()} style={{ marginTop: 12 }}>
          Reintentar
        </Button>
      </div>
    );
  }

  const stockData = [...productos]
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 10)
    .map((p) => ({ name: p.nombre, stock: p.stock }));

  const catCount: Record<string, number> = {};
  productos.forEach((p) => {
    const name = p.categoria?.nombre_categoria || 'Sin categoría';
    catCount[name] = (catCount[name] || 0) + 1;
  });
  const pieData = Object.entries(catCount).map(([name, value]) => ({ name, value }));

  return (
    <div className={styles.page}>
      <Typography.Title level={4} className={styles.title}>
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
          className={styles.alert}
          type="warning"
          showIcon
          message={`${bajoStock.length} producto(s) con stock bajo o agotado`}
          description={bajoStock.map((p) => p.nombre).join(', ')}
        />
      )}

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Stock por producto (top 10)">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stockData} margin={{ bottom: 60 }}>
                <XAxis dataKey="name" angle={-20} textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="stock" fill="#1677ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Productos por categoría">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Card className={styles.card} title="Últimos movimientos" style={{ marginTop: 16 }}>
        {movimientos.length === 0 ? (
          <Typography.Text type="secondary">No hay movimientos registrados</Typography.Text>
        ) : (
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
              { title: 'Cliente', dataIndex: ['cliente', 'nombre'], key: 'cliente' },
              { title: 'Motivo', dataIndex: 'motivo', key: 'motivo' },
              {
                title: 'Fecha',
                dataIndex: 'fecha_movimiento',
                key: 'fecha',
                render: (v: string) => new Date(v).toLocaleDateString('es-CO'),
              },
            ]}
          />
        )}
      </Card>
    </div>
  );
}
