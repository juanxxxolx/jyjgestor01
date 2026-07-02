import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovimientoDto, TipoMovimiento } from './dto/create-movimiento.dto';

@Injectable()
export class MovimientosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMovimientoDto, userId: number) {
    const producto = await this.prisma.producto.findUnique({ where: { id_producto: dto.id_producto } });
    if (!producto) throw new NotFoundException(`Producto ${dto.id_producto} no encontrado`);

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
        },
        include: { producto: true, usuario: { select: { id_usuario: true, nombre: true } } },
      }),
      this.prisma.producto.update({
        where: { id_producto: dto.id_producto },
        data: { stock: nuevoStock },
      }),
    ]);

    return { success: true, data: movimiento };
  }

  async findAll(productoId?: number) {
    const movimientos = await this.prisma.movimiento.findMany({
      where: productoId ? { id_producto: productoId } : undefined,
      include: {
        producto: { select: { id_producto: true, nombre: true, referencia: true } },
        usuario: { select: { id_usuario: true, nombre: true } },
      },
      orderBy: { fecha_movimiento: 'desc' },
      take: 200,
    });
    return { success: true, data: movimientos };
  }

  async findByProducto(productoId: number) {
    return this.findAll(productoId);
  }

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
