/**
 * @fileoverview Servicio del módulo de Precios Históricos.
 * Contiene la lógica de negocio para consultar el historial de cambios
 * de precios de productos.
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PreciosHistoricosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene todos los precios históricos, opcionalmente filtrados por producto.
   * @param productoId - ID del producto para filtrar (opcional)
   * @returns Lista de precios históricos
   */
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

  /**
   * Obtiene el historial de precios de un producto específico.
   * @param productoId - ID del producto
   * @returns Historial de precios del producto
   */
  async findByProducto(productoId: number) {
    return this.findAll(productoId);
  }
}
