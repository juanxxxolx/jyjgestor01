import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  async ventasPorFecha(desde?: string, hasta?: string) {
    const where: any = {};
    if (desde || hasta) {
      where.created_at = {};
      if (desde) where.created_at.gte = new Date(desde);
      if (hasta) where.created_at.lte = new Date(hasta);
    }

    const ventas = await this.prisma.venta.findMany({
      where,
      include: {
        detalle: { include: { producto: { select: { nombre: true, referencia: true } } } },
        cliente: { select: { nombre: true } },
        usuario: { select: { nombre: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    const totalVentas = ventas.length;
    const ingresos = ventas.reduce((sum, v) => sum + Number(v.total), 0);
    const ticketPromedio = totalVentas > 0 ? ingresos / totalVentas : 0;

    return {
      success: true,
      data: { ventas, totalVentas, ingresos, ticketPromedio },
    };
  }

  async ventasPorProducto(desde?: string, hasta?: string) {
    const where: any = {};
    if (desde || hasta) {
      where.created_at = {};
      if (desde) where.created_at.gte = new Date(desde);
      if (hasta) where.created_at.lte = new Date(hasta);
    }

    const detalles = await this.prisma.detalleVenta.findMany({
      where: { venta: where },
      include: { producto: { select: { nombre: true, referencia: true, precio_venta: true } } },
    });

    const agg: Record<number, { nombre: string; referencia: string; cantidad: number; total: number }> = {};
    for (const d of detalles) {
      if (!agg[d.id_producto]) agg[d.id_producto] = { nombre: d.producto.nombre, referencia: d.producto.referencia, cantidad: 0, total: 0 };
      agg[d.id_producto].cantidad += d.cantidad;
      agg[d.id_producto].total += Number(d.subtotal);
    }

    return { success: true, data: Object.values(agg).sort((a, b) => b.total - a.total) };
  }

  async ventasPorCliente(desde?: string, hasta?: string) {
    const where: any = {};
    if (desde || hasta) {
      where.created_at = {};
      if (desde) where.created_at.gte = new Date(desde);
      if (hasta) where.created_at.lte = new Date(hasta);
    }

    const ventas = await this.prisma.venta.findMany({
      where,
      include: { cliente: { select: { nombre: true } } },
    });

    const agg: Record<string, { cliente: string; cantidad: number; total: number }> = {};
    for (const v of ventas) {
      const nombre = v.cliente?.nombre || 'Mostrador';
      if (!agg[nombre]) agg[nombre] = { cliente: nombre, cantidad: 0, total: 0 };
      agg[nombre].cantidad++;
      agg[nombre].total += Number(v.total);
    }

    return { success: true, data: Object.values(agg).sort((a, b) => b.total - a.total) };
  }

  async ventasDiarias(desde?: string, hasta?: string) {
    const fin = hasta ? new Date(hasta) : new Date();
    const inicio = desde ? new Date(desde) : new Date(fin.getTime() - 30 * 24 * 60 * 60 * 1000);

    const ventas = await this.prisma.venta.findMany({
      where: { created_at: { gte: inicio, lte: fin } },
      orderBy: { created_at: 'asc' },
    });

    const dias: Record<string, { fecha: string; total: number; cantidad: number }> = {};
    for (const v of ventas) {
      const fecha = v.created_at.toISOString().slice(0, 10);
      if (!dias[fecha]) dias[fecha] = { fecha, total: 0, cantidad: 0 };
      dias[fecha].total += Number(v.total);
      dias[fecha].cantidad++;
    }

    return { success: true, data: Object.values(dias) };
  }
}
