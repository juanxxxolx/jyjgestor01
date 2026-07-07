export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

export interface Cliente {
  id_cliente: number;
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  id_usuario?: number;
}

export interface Categoria {
  id_categoria: number;
  nombre_categoria: string;
}

export interface Producto {
  id_producto: number;
  nombre: string;
  referencia: string;
  imagen_url?: string;
  precio_venta: number;
  stock: number;
  stock_minimo: number;
  id_categoria?: number;
  categoria?: Categoria;
}

export interface Movimiento {
  id_movimiento: number;
  id_producto: number;
  tipo_movimiento: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  cantidad: number;
  motivo: string;
  fecha_movimiento: string;
  id_usuario?: number;
  id_cliente?: number;
  producto?: Pick<Producto, 'id_producto' | 'nombre' | 'referencia'>;
  usuario?: { id_usuario: number; nombre: string };
  cliente?: Pick<Cliente, 'id_cliente' | 'nombre'>;
}

export interface PrecioHistorico {
  id_historico: number;
  id_producto: number;
  precio_anterior: number;
  precio_nuevo: number;
  fecha_cambio: string;
  id_usuario?: number;
  producto?: Pick<Producto, 'id_producto' | 'nombre' | 'referencia'>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginatedMeta;
}

export interface Usuario {
  id_usuario: number;
  nombre: string;
  email: string;
  id_rol: number;
  activo: boolean;
  fecha_creacion?: string;
}

export interface VentaDetalle {
  id_detalle?: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto?: Pick<Producto, 'id_producto' | 'nombre' | 'referencia'>;
}

export interface Venta {
  id_venta: number;
  id_usuario: number;
  id_cliente?: number;
  total: number;
  estado: string;
  created_at: string;
  cliente?: Pick<Cliente, 'id_cliente' | 'nombre'>;
  usuario?: Pick<Usuario, 'id_usuario' | 'nombre'>;
  detalle?: VentaDetalle[];
}

export interface AuditLog {
  id: number;
  id_usuario?: number;
  usuario_nombre: string;
  accion: string;
  entidad: string;
  id_entidad?: number;
  detalle?: string;
  ip?: string;
  created_at: string;
}
