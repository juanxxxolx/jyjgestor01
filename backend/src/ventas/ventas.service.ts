import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { paginate } from '../common/utils/pagination';

@Injectable()
export class VentasService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async create(dto: CreateVentaDto, userId: number, userName?: string, ip?: string) {
    const productos = await this.prisma.producto.findMany({
      where: { id_producto: { in: dto.detalle.map((d) => d.id_producto) } },
    });

    const productosMap = new Map(productos.map((p) => [p.id_producto, p]));

    const detalleData = dto.detalle.map((item) => {
      const producto = productosMap.get(item.id_producto);
      if (!producto) throw new NotFoundException(`Producto ${item.id_producto} no encontrado`);
      if (producto.stock < item.cantidad) {
        throw new BadRequestException(`Stock insuficiente para "${producto.nombre}": disponible ${producto.stock}, requerido ${item.cantidad}`);
      }
      const precio_unitario = Number(producto.precio_venta);
      return {
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        precio_unitario,
        subtotal: precio_unitario * item.cantidad,
        producto,
      };
    });

    const total = detalleData.reduce((sum, d) => sum + d.subtotal, 0);

    const venta = await this.prisma.$transaction(async (tx) => {
      const v = await tx.venta.create({
        data: {
          id_usuario: userId,
          id_cliente: dto.id_cliente ?? null,
          total,
          detalle: {
            create: detalleData.map((d) => ({
              id_producto: d.id_producto,
              cantidad: d.cantidad,
              precio_unitario: d.precio_unitario,
              subtotal: d.subtotal,
            })),
          },
        },
        include: {
          detalle: { include: { producto: { select: { id_producto: true, nombre: true, referencia: true } } } },
          cliente: { select: { id_cliente: true, nombre: true } },
          usuario: { select: { id_usuario: true, nombre: true } },
        },
      });

      for (const d of detalleData) {
        await tx.producto.update({
          where: { id_producto: d.id_producto },
          data: { stock: { decrement: d.cantidad } },
        });
        await tx.movimiento.create({
          data: {
            id_producto: d.id_producto,
            tipo_movimiento: 'SALIDA',
            cantidad: d.cantidad,
            motivo: `Venta #${v.id_venta}`,
            id_usuario: userId,
            id_cliente: dto.id_cliente ?? null,
          },
        });
      }

      return v;
    });

    this.audit.log({
      userId, userName, ip,
      action: 'Registró venta',
      entity: 'Venta', entityId: venta.id_venta,
      detail: `Venta #${venta.id_venta} — $${Number(total).toLocaleString('es-CO')} — ${detalleData.length} producto(s)`,
    });

    return { success: true, data: venta };
  }

  async findAll(pagination: PaginationDto) {
    const result = await paginate(this.prisma.venta, pagination, {
      include: {
        detalle: { include: { producto: { select: { id_producto: true, nombre: true, referencia: true } } } },
        cliente: { select: { id_cliente: true, nombre: true } },
        usuario: { select: { id_usuario: true, nombre: true } },
      },
      orderBy: { created_at: 'desc' },
    });
    return { success: true, ...result };
  }

  async findOne(id: number) {
    const venta = await this.prisma.venta.findUnique({
      where: { id_venta: id },
      include: {
        detalle: { include: { producto: true } },
        cliente: true,
        usuario: { select: { id_usuario: true, nombre: true } },
      },
    });
    if (!venta) throw new NotFoundException(`Venta ${id} no encontrada`);
    return { success: true, data: venta };
  }

  async anular(id: number, userId: number, userName?: string, ip?: string) {
    const venta = await this.prisma.venta.findUnique({
      where: { id_venta: id },
      include: { detalle: true },
    });
    if (!venta) throw new NotFoundException(`Venta ${id} no encontrada`);
    if (venta.estado === 'ANULADA') throw new BadRequestException(`La venta ${id} ya está anulada`);

    await this.prisma.$transaction(async (tx) => {
      await tx.venta.update({
        where: { id_venta: id },
        data: { estado: 'ANULADA' },
      });

      for (const d of venta.detalle) {
        await tx.producto.update({
          where: { id_producto: d.id_producto },
          data: { stock: { increment: d.cantidad } },
        });
        await tx.movimiento.create({
          data: {
            id_producto: d.id_producto,
            tipo_movimiento: 'ENTRADA',
            cantidad: d.cantidad,
            motivo: `Anulación venta #${id}`,
            id_usuario: userId,
            id_cliente: venta.id_cliente,
          },
        });
      }
    });

    this.audit.log({
      userId, userName, ip,
      action: 'Anuló venta',
      entity: 'Venta', entityId: id,
      detail: `Venta #${id} anulada — $${Number(venta.total).toLocaleString('es-CO')}`,
    });

    return { success: true, message: `Venta #${id} anulada, stock restituido` };
  }
}
