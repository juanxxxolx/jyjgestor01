import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PreciosHistoricosService {
  constructor(private prisma: PrismaService) {}

  async findAll(productoId?: number) {
    const where = productoId ? { id_producto: productoId } : {};
    const historicos = await this.prisma.precioHistorico.findMany({
      where,
      include: {
        producto: { select: { id_producto: true, nombre: true, referencia: true } },
      },
      orderBy: { fecha_cambio: 'desc' },
      take: 200,
    });
    return { success: true, data: historicos };
  }

  async findByProducto(productoId: number) {
    return this.findAll(productoId);
  }
}
