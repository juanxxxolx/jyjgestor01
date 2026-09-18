/**
 * @file Hook personalizado para la página Dashboard.
 * Obtiene y centraliza los datos necesarios: productos, clientes,
 * movimientos y productos con bajo stock.
 */

import { useQuery } from '@tanstack/react-query';
import { productosApi } from '../../api/productos.api';
import { clientesApi } from '../../api/clientes.api';
import { movimientosApi } from '../../api/movimientos.api';
import type { Producto, Movimiento } from '../../types';

/**
 * Hook que ejecuta tres consultas paralelas (productos, clientes, movimientos)
 * y deriva la lista de productos con stock por debajo del mínimo.
 *
 * @returns {object} - `productos`, `clientes`, `movimientos`, `bajoStock`,
 *                     `isLoading` (true mientras alguna consulta cargue),
 *                     `isError` (true si alguna consulta falló).
 */
export function useDashboard() {
  const { data: productosRes, isLoading: loadingProd, isError: errorProd } = useQuery({
    queryKey: ['productos-dash'],
    queryFn: () => productosApi.getAll(1, 200),
  });
  const { data: clientesRes, isLoading: loadingCli, isError: errorCli } = useQuery({
    queryKey: ['clientes-dash'],
    queryFn: () => clientesApi.getAll(undefined, 1, 200),
  });
  const { data: movimientosRes, isLoading: loadingMov, isError: errorMov } = useQuery({
    queryKey: ['movimientos-dash'],
    queryFn: () => movimientosApi.getAll(undefined, 1, 200),
  });

  const productos: Producto[] = productosRes?.data ?? [];
  const clientes = clientesRes?.data ?? [];
  const movimientos: Movimiento[] = movimientosRes?.data ?? [];
  const bajoStock = productos.filter((p) => p.stock <= p.stock_minimo);

  const isLoading = loadingProd || loadingCli || loadingMov;
  const isError = errorProd || errorCli || errorMov;

  return { productos, clientes, movimientos, bajoStock, isLoading, isError };
}
