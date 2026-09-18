/**
 * @fileoverview Servicio del módulo de Cotizaciones.
 * Contiene la lógica de negocio para crear, consultar y convertir
 * cotizaciones en ventas con descuento de stock.
 */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCotizacionDto, UpdateCotizacionDto } from './dto/create-cotizacion.dto';
import { paginate } from '../common/utils/pagination';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class CotizacionesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea una nueva cotización con sus detalles.
   * No modifica el stock ni registra movimientos.
   * @param dto - Datos de la cotización
   * @param userId - ID del usuario que crea la cotización
   * @returns Cotización creada con detalles
   */
  async create(dto: CreateCotizacionDto, userId: number) {
    const productos = await this.prisma.producto.findMany({
      where: { id_producto: { in: dto.detalle.map((d) => d.id_producto) } },
    });
    const productosMap = new Map(productos.map((p) => [p.id_producto, p]));

    const detalleData = dto.detalle.map((item) => {
      const producto = productosMap.get(item.id_producto);
      if (!producto) throw new NotFoundException(`Producto ${item.id_producto} no encontrado`);
      const precio_unitario = Number(producto.precio_venta);
      return { id_producto: item.id_producto, cantidad: item.cantidad, precio_unitario, subtotal: precio_unitario * item.cantidad };
    });

    const total = detalleData.reduce((sum, d) => sum + d.subtotal, 0);

    const cotizacion = await this.prisma.cotizacion.create({
      data: {
        id_usuario: userId,
        id_cliente: dto.id_cliente ?? null,
        total,
        detalle: { create: detalleData },
      },
      include: { detalle: { include: { producto: true } }, cliente: true, usuario: { select: { id_usuario: true, nombre: true } } },
    });

    return { success: true, data: cotizacion };
  }

  /**
   * Obtiene todas las cotizaciones con paginación.
   * @param pagination - Parámetros de paginación
   * @returns Resultado paginado con lista de cotizaciones
   */
  async findAll(pagination: PaginationDto) {
    const result = await paginate(this.prisma.cotizacion, pagination, {
      include: {
        detalle: { include: { producto: { select: { id_producto: true, nombre: true } } } },
        cliente: { select: { id_cliente: true, nombre: true } },
        usuario: { select: { id_usuario: true, nombre: true } },
      },
      orderBy: { created_at: 'desc' },
    });
    return { success: true, ...result };
  }

  /**
   * Obtiene una cotización por su ID.
   * @param id - ID de la cotización
   * @returns Cotización encontrada
   */
  async findOne(id: number) {
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id_cotizacion: id },
      include: {
        detalle: { include: { producto: true } },
        cliente: true,
        usuario: { select: { id_usuario: true, nombre: true } },
      },
    });
    if (!cotizacion) throw new NotFoundException(`Cotización ${id} no encontrada`);
    return { success: true, data: cotizacion };
  }

  /**
   * Actualiza una cotización pendiente.
   * Solo permite editar si el estado es PENDIENTE.
   * Recalcula el total si se envía nuevo detalle.
   */
  async update(id: number, dto: UpdateCotizacionDto, userId: number) {
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id_cotizacion: id },
      include: { detalle: true },
    });
    if (!cotizacion) throw new NotFoundException(`Cotización ${id} no encontrada`);
    if (cotizacion.estado !== 'PENDIENTE') throw new BadRequestException('Solo se pueden editar cotizaciones pendientes');

    let total = Number(cotizacion.total);
    let newDetalleData: { id_producto: number; cantidad: number; precio_unitario: number; subtotal: number }[] | null = null;

    if (dto.detalle && dto.detalle.length > 0) {
      const productos = await this.prisma.producto.findMany({
        where: { id_producto: { in: dto.detalle.map((d) => d.id_producto) } },
      });
      const productosMap = new Map(productos.map((p) => [p.id_producto, p]));

      newDetalleData = dto.detalle.map((item) => {
        const producto = productosMap.get(item.id_producto);
        if (!producto) throw new NotFoundException(`Producto ${item.id_producto} no encontrado`);
        const precio_unitario = Number(producto.precio_venta);
        return { id_producto: item.id_producto, cantidad: item.cantidad, precio_unitario, subtotal: precio_unitario * item.cantidad };
      });

      total = newDetalleData.reduce((sum, d) => sum + d.subtotal, 0);
    }

    await this.prisma.$transaction(async (tx) => {
      if (newDetalleData) {
        await tx.detalleCotizacion.deleteMany({ where: { id_cotizacion: id } });
        await tx.detalleCotizacion.createMany({
          data: newDetalleData.map((d) => ({ id_cotizacion: id, id_producto: d.id_producto, cantidad: d.cantidad, precio_unitario: d.precio_unitario, subtotal: d.subtotal })),
        });
      }
      if (dto.id_cliente !== undefined) {
        await tx.cotizacion.update({ where: { id_cotizacion: id }, data: { id_cliente: dto.id_cliente ?? null, total } });
      } else if (newDetalleData) {
        await tx.cotizacion.update({ where: { id_cotizacion: id }, data: { total } });
      }
    });

    const updated = await this.prisma.cotizacion.findUnique({
      where: { id_cotizacion: id },
      include: { detalle: { include: { producto: true } }, cliente: true, usuario: { select: { id_usuario: true, nombre: true } } },
    });
    return { success: true, data: updated };
  }

  /**
   * Elimina una cotización pendiente.
   * Solo permite borrar si el estado es PENDIENTE.
   */
  async remove(id: number) {
    const cotizacion = await this.prisma.cotizacion.findUnique({ where: { id_cotizacion: id } });
    if (!cotizacion) throw new NotFoundException(`Cotización ${id} no encontrada`);
    if (cotizacion.estado !== 'PENDIENTE') throw new BadRequestException('Solo se pueden eliminar cotizaciones pendientes');

    await this.prisma.$transaction(async (tx) => {
      await tx.detalleCotizacion.deleteMany({ where: { id_cotizacion: id } });
      await tx.cotizacion.delete({ where: { id_cotizacion: id } });
    });
    return { success: true, message: 'Cotización eliminada' };
  }

  /**
   * Convierte una cotización pendiente en una venta.
   * Cambia el estado a CONVERTIDA, descuenta stock y registra movimientos de salida.
   * @param id - ID de la cotización
   * @param userId - ID del usuario que realiza la conversión
   * @returns Mensaje de confirmación
   */
  async convertirAVenta(id: number, userId: number) {
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id_cotizacion: id },
      include: { detalle: true },
    });
    if (!cotizacion) throw new NotFoundException(`Cotización ${id} no encontrada`);
    if (cotizacion.estado !== 'PENDIENTE') throw new NotFoundException('La cotización ya fue procesada');

    await this.prisma.$transaction(async (tx) => {
      await tx.cotizacion.update({ where: { id_cotizacion: id }, data: { estado: 'CONVERTIDA' } });

      const venta = await tx.venta.create({
        data: {
          id_usuario: userId,
          id_cliente: cotizacion.id_cliente,
          total: Number(cotizacion.total),
          detalle: { create: cotizacion.detalle.map((d) => ({ id_producto: d.id_producto, cantidad: d.cantidad, precio_unitario: Number(d.precio_unitario), subtotal: Number(d.subtotal) })) },
        },
      });

      for (const d of cotizacion.detalle) {
        await tx.producto.update({ where: { id_producto: d.id_producto }, data: { stock: { decrement: d.cantidad } } });
        await tx.movimiento.create({ data: { id_producto: d.id_producto, tipo_movimiento: 'SALIDA', cantidad: d.cantidad, motivo: `Venta #${venta.id_venta} (desde cotización #${id})`, id_usuario: userId, id_cliente: cotizacion.id_cliente } });
      }
    });

    return { success: true, message: 'Cotización convertida a venta' };
  }
}
