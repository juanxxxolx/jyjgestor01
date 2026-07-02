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
  producto?: Pick<Producto, 'id_producto' | 'nombre' | 'referencia'>;
  usuario?: { id_usuario: number; nombre: string };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
