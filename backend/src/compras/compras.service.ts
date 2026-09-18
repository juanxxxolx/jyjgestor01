/**
 * @fileoverview Servicio del módulo de Compras.
 * Contiene la lógica de negocio para registrar compras, incrementar stock
 * y registrar movimientos de entrada en el inventario.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { paginate } from '../common/utils/pagination';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ComprasService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  /**
   * Crea una nueva compra con transacción.
   * Incrementa el stock de cada producto y registra movimientos de entrada.
   * @param dto - Datos de la compra
   * @param userId - ID del usuario que registra
   * @param userName - Nombre del usuario para auditoría
   * @param ip - Dirección IP para auditoría
   * @returns Compra creada
   */
  async create(dto: CreateCompraDto, userId: number, userName?: string, ip?: string) {
    const productos = await this.prisma.producto.findMany({ where: { id_producto: { in: dto.detalle.map((d) => d.id_producto) } } });
    const productosMap = new Map(productos.map((p) => [p.id_producto, p]));

    const detalleData = dto.detalle.map((item) => {
      if (!productosMap.has(item.id_producto)) throw new NotFoundException(`Producto ${item.id_producto} no encontrado`);
      const subtotal = item.costo_unitario * item.cantidad;
      return { id_producto: item.id_producto, cantidad: item.cantidad, costo_unitario: item.costo_unitario, subtotal };
    });

    const total = detalleData.reduce((s, d) => s + d.subtotal, 0);

    const compra = await this.prisma.$transaction(async (tx) => {
      const c = await tx.compra.create({
        data: { id_usuario: userId, id_proveedor: dto.id_proveedor ?? null, total, detalle: { create: detalleData } },
      });
      for (const d of detalleData) {
        await tx.producto.update({ where: { id_producto: d.id_producto }, data: { stock: { increment: d.cantidad } } });
        await tx.movimiento.create({ data: { id_producto: d.id_producto, tipo_movimiento: 'ENTRADA', cantidad: d.cantidad, motivo: `Compra #${c.id_compra}`, id_usuario: userId } });
      }
      return c;
    });

    this.audit.log({ userId, userName, ip, action: 'Registró compra', entity: 'Compra', entityId: compra.id_compra, detail: `Compra #${compra.id_compra} — $${total} — ${detalleData.length} producto(s)` });
    return { success: true, data: compra };
  }

  /**
   * Obtiene todas las compras con paginación.
   * @param pagination - Parámetros de paginación
   * @returns Resultado paginado con lista de compras
   */
  async findAll(pagination: PaginationDto) {
    const result = await paginate(this.prisma.compra, pagination, {
      include: { detalle: { include: { producto: { select: { id_producto: true, nombre: true } } } }, proveedor: { select: { id_proveedor: true, nombre: true } }, usuario: { select: { id_usuario: true, nombre: true } } },
      orderBy: { created_at: 'desc' },
    });
    return { success: true, ...result };
  }

  /**
   * Obtiene una compra por su ID.
   * @param id - ID de la compra
   * @returns Compra encontrada con detalles
   */
  async findOne(id: number) {
    const compra = await this.prisma.compra.findUnique({ where: { id_compra: id }, include: { detalle: { include: { producto: true } }, proveedor: true, usuario: { select: { id_usuario: true, nombre: true } } } });
    if (!compra) throw new NotFoundException('Compra no encontrada');
    return { success: true, data: compra };
  }
}
