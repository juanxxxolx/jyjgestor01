/**
 * @fileoverview Definiciones de tipos y interfaces compartidas de la aplicación.
 * Centraliza todos los tipos TypeScript usados en el frontend.
 */

/** Representa un usuario del sistema. */
export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: number;
}

/** Estado de autenticación del usuario en sesión. */
export interface AuthState {
  user: User | null;
  token: string | null;
}

/** Representa un cliente con información de contacto y saldo. */
export interface Cliente {
  id_cliente: number;
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  id_usuario?: number;
  saldo?: number;
}

/** Representa un proveedor con datos de contacto. */
export interface Proveedor {
  id_proveedor: number;
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

/** Detalle de una línea en una orden de compra. */
export interface DetalleCompra {
  id_detalle?: number;
  id_producto: number;
  cantidad: number;
  costo_unitario: number;
  subtotal: number;
  producto?: Pick<Producto, 'id_producto' | 'nombre'>;
}

/** Representa una compra realizada a un proveedor. */
export interface Compra {
  id_compra: number;
  id_usuario: number;
  id_proveedor?: number;
  total: number;
  created_at: string;
  usuario?: Pick<Usuario, 'id_usuario' | 'nombre'>;
  proveedor?: Pick<Proveedor, 'id_proveedor' | 'nombre'>;
  detalle?: DetalleCompra[];
}

/** Representa un abono registrado a un cliente. */
export interface Abono {
  id_abono: number;
  id_cliente: number;
  monto: number;
  created_at: string;
}

/** Representa una categoría para clasificar productos. */
export interface Categoria {
  id_categoria: number;
  nombre_categoria: string;
}

/** Representa un producto con precio, stock y categoría asociada. */
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

/** Representa un movimiento de inventario (entrada, salida o ajuste). */
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

/** Historial de cambios de precio de un producto. */
export interface PrecioHistorico {
  id_historico: number;
  id_producto: number;
  precio_anterior: number;
  precio_nuevo: number;
  fecha_cambio: string;
  id_usuario?: number;
  producto?: Pick<Producto, 'id_producto' | 'nombre' | 'referencia'>;
}

/** Respuesta estándar de la API con indicador de éxito. */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/** Metadatos de paginación devueltos por la API. */
export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Respuesta paginada que extiende ApiResponse con metadatos. */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginatedMeta;
}

/** Representa un usuario del sistema con estado activo/inactivo. */
export interface Usuario {
  id_usuario: number;
  nombre: string;
  email: string;
  id_rol: number;
  activo: boolean;
  fecha_creacion?: string;
}

/** Detalle de una línea en una venta o cotización. */
export interface VentaDetalle {
  id_detalle?: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto?: Pick<Producto, 'id_producto' | 'nombre' | 'referencia'>;
}

/** Representa una venta o factura emitida. */
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

/** Registro de auditoría de acciones realizadas en el sistema. */
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
