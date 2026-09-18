/**
 * @fileoverview Servicio del módulo de Movimientos de Inventario.
 * Contiene la lógica de negocio para registrar movimientos manuales
 * (entradas, salidas, ajustes), actualizar el stock y consultar movimientos.
 */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateMovimientoDto, TipoMovimiento } from './dto/create-movimiento.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { paginate } from '../common/utils/pagination';

@Injectable()
export class MovimientosService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  /**
   * Crea un movimiento de inventario y actualiza el stock del producto.
   * Valida existencia del producto y cliente, y suficiencia de stock para salidas.
   * @param dto - Datos del movimiento
   * @param userId - ID del usuario que registra
   * @param userName - Nombre del usuario para auditoría
   * @param ip - Dirección IP para auditoría
   * @returns Movimiento creado
   */
  async create(dto: CreateMovimientoDto, userId: number, userName?: string, ip?: string) {
    const producto = await this.prisma.producto.findUnique({ where: { id_producto: dto.id_producto } });
    if (!producto) throw new NotFoundException(`Producto ${dto.id_producto} no encontrado`);

    if (dto.id_cliente) {
      const cliente = await this.prisma.cliente.findUnique({ where: { id_cliente: dto.id_cliente } });
      if (!cliente) throw new NotFoundException(`Cliente ${dto.id_cliente} no encontrado`);
    }

    const nuevoStock = this.calcularNuevoStock(Number(producto.stock), dto.tipo_movimiento, dto.cantidad);
    if (nuevoStock < 0) throw new BadRequestException(`Stock insuficiente. Stock actual: ${producto.stock}`);

    const [movimiento] = await this.prisma.$transaction([
      this.prisma.movimiento.create({
        data: {
          id_producto: dto.id_producto,
          tipo_movimiento: dto.tipo_movimiento,
          cantidad: dto.cantidad,
          motivo: dto.motivo,
          id_usuario: userId,
          id_cliente: dto.id_cliente,
        },
        include: {
          producto: { select: { id_producto: true, nombre: true, referencia: true } },
          usuario: { select: { id_usuario: true, nombre: true } },
          cliente: { select: { id_cliente: true, nombre: true } },
        },
      }),
      this.prisma.producto.update({
        where: { id_producto: dto.id_producto },
        data: { stock: nuevoStock },
      }),
    ]);

    this.audit.log({
      userId, userName, ip,
      action: `Registró ${dto.tipo_movimiento.toLowerCase()}`,
      entity: 'Movimiento', entityId: movimiento.id_movimiento,
      detail: `${movimiento.producto.nombre} — cantidad: ${dto.cantidad} — motivo: ${dto.motivo}`,
    });

    return { success: true, data: movimiento };
  }

  /**
   * Obtiene todos los movimientos con paginación y filtro opcional por producto.
   * @param productoId - ID del producto para filtrar (opcional)
   * @param pagination - Parámetros de paginación
   * @returns Resultado paginado con lista de movimientos
   */
  async findAll(productoId: number | undefined, pagination: PaginationDto) {
    const where = productoId ? { id_producto: productoId } : undefined;
    const result = await paginate(this.prisma.movimiento, pagination, {
      where,
      include: {
        producto: { select: { id_producto: true, nombre: true, referencia: true } },
        usuario: { select: { id_usuario: true, nombre: true } },
        cliente: { select: { id_cliente: true, nombre: true } },
      },
      orderBy: { fecha_movimiento: 'desc' },
    });
    return { success: true, ...result };
  }

  /**
   * Obtiene los movimientos de un producto específico.
   * @param productoId - ID del producto
   * @param pagination - Parámetros de paginación
   * @returns Resultado paginado con movimientos del producto
   */
  async findByProducto(productoId: number, pagination: PaginationDto) {
    return this.findAll(productoId, pagination);
  }

  /**
   * Calcula el nuevo stock según el tipo de movimiento.
   * @param stockActual - Stock actual del producto
   * @param tipo - Tipo de movimiento (ENTRADA, SALIDA, AJUSTE)
   * @param cantidad - Cantidad del movimiento
   * @returns Nuevo valor de stock calculado
   */
  private calcularNuevoStock(stockActual: number, tipo: TipoMovimiento, cantidad: number): number {
    switch (tipo) {
      case TipoMovimiento.ENTRADA:
        return stockActual + cantidad;
      case TipoMovimiento.SALIDA:
        return stockActual - cantidad;
      case TipoMovimiento.AJUSTE:
        return cantidad;
    }
  }
}
