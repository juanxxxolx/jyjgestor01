import { Table, Skeleton } from 'antd';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef[];
  loading?: boolean;
  pagination?: any;
  rowKey: string | ((record: any) => string);
  onRowClick?: (record: any) => void;
  rowSelection?: { selectedRowKeys: string[]; onChange: (keys: string[]) => void };
  emptyText?: string;
}

export const DataTable = <T,>({
  data,
  columns,
  loading = false,
  pagination,
  rowKey = 'id',
  onRowClick,
  rowSelection,
  emptyText = 'No hay datos disponibles',
}: DataTableProps<T>) => (
  <Table
    dataSource={data}
    columns={columns}
    loading={loading ? { spinning: true, indicator: <Skeleton active />} : false}
    rowKey={rowKey}
    pagination={pagination}
    scroll={{ x: 'max-content' }}
    locale={{ emptyText: emptyText }}
  />
);

// Tipos para columnas
export interface ColumnDef {
  title: string;
  dataIndex: string;
  key: string;
  width?: number;
  render?: (value: any, record: any, index: number) => React.ReactNode;
  sorter?: (a: any, b: any) => number;
  filters?: { text: string; value: any }[];
  onFilter?: (value: any, record: any) => boolean;
}