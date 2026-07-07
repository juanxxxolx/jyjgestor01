import { useState } from 'react';
import { Form, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ventasApi } from '../../api/ventas.api';
import { productosApi } from '../../api/productos.api';
import { clientesApi } from '../../api/clientes.api';
import type { Producto, Cliente } from '../../types';

export interface LineaVenta {
  key: string;
  id_producto: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export function useVentas() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [lineas, setLineas] = useState<LineaVenta[]>([]);
  const [idCliente, setIdCliente] = useState<number | undefined>(undefined);
  const [reciboVenta, setReciboVenta] = useState<any>(null);
  const [form] = Form.useForm();
  const qc = useQueryClient();

  const { data: ventasRes, isLoading } = useQuery({
    queryKey: ['ventas', page, limit],
    queryFn: () => ventasApi.getAll(page, limit),
  });

  const { data: productosRes } = useQuery({
    queryKey: ['productos-venta'],
    queryFn: () => productosApi.getAll(1, 1000),
  });

  const { data: clientesRes } = useQuery({
    queryKey: ['clientes-venta'],
    queryFn: () => clientesApi.getAll(undefined, 1, 1000),
  });

  const { data: reciboData, isLoading: reciboLoading } = useQuery({
    queryKey: ['venta-recibo', reciboVenta?.id_venta],
    queryFn: () => ventasApi.getById(reciboVenta!.id_venta),
    enabled: !!reciboVenta,
  });

  const createMutation = useMutation({
    mutationFn: ventasApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ventas'] });
      qc.invalidateQueries({ queryKey: ['productos-venta'] });
      setLineas([]);
      setIdCliente(undefined);
      message.success('Venta registrada');
    },
    onError: (e: any) => message.error(e.response?.data?.message || 'Error al registrar venta'),
  });

  const anularMutation = useMutation({
    mutationFn: ventasApi.anular,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ventas'] });
      qc.invalidateQueries({ queryKey: ['productos-venta'] });
      message.success('Venta anulada');
    },
    onError: (e: any) => message.error(e.response?.data?.message || 'Error al anular venta'),
  });

  const agregarProducto = (producto: Producto) => {
    const existente = lineas.find((l) => l.id_producto === producto.id_producto);
    if (existente) {
      setLineas(lineas.map((l) =>
        l.id_producto === producto.id_producto
          ? { ...l, cantidad: l.cantidad + 1, subtotal: (l.cantidad + 1) * l.precio_unitario }
          : l,
      ));
    } else {
      setLineas([
        ...lineas,
        {
          key: `${producto.id_producto}-${Date.now()}`,
          id_producto: producto.id_producto,
          nombre: producto.nombre,
          cantidad: 1,
          precio_unitario: Number(producto.precio_venta),
          subtotal: Number(producto.precio_venta),
        },
      ]);
    }
  };

  const cambiarCantidad = (key: string, cantidad: number) => {
    setLineas(lineas.map((l) =>
      l.key === key ? { ...l, cantidad, subtotal: cantidad * l.precio_unitario } : l,
    ));
  };

  const quitarLinea = (key: string) => {
    setLineas(lineas.filter((l) => l.key !== key));
  };

  const total = lineas.reduce((sum, l) => sum + l.subtotal, 0);

  const registrarVenta = () => {
    if (lineas.length === 0) {
      message.warning('Agrega al menos un producto');
      return;
    }
    createMutation.mutate({
      id_cliente: idCliente || undefined,
      detalle: lineas.map((l) => ({ id_producto: l.id_producto, cantidad: l.cantidad })),
    });
  };

  return {
    ventasRes, isLoading,
    productosRes, clientesRes,
    lineas, idCliente, setIdCliente,
    total, form, page, setPage, limit,
    reciboVenta, reciboData, reciboLoading,
    createMutation, anularMutation,
    agregarProducto, cambiarCantidad, quitarLinea, registrarVenta,
    setReciboVenta,
  };
}
