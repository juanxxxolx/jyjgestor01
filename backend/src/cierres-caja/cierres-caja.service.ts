/**
 * @fileoverview Servicio del módulo de Cierres de Caja.
 * Contiene la lógica de negocio para crear/actualizar cierres de caja,
 * consultar el cierre del día y listar cierres históricos con paginación.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCierreDto } from './dto/create-cierre.dto';
import { paginate } from '../common/utils/pagination';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class CierresCajaService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea o actualiza el cierre de caja del día actual.
   * Calcula el total de ventas en efectivo y la diferencia con lo declarado.
   * Si ya existe un cierre hoy, lo actualiza; si no, lo crea.
   * @param dto - Datos del cierre
   * @param userId - ID del usuario que realiza el cierre
   * @returns Cierre de caja registrado
   */
  async create(dto: CreateCierreDto, userId: number) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const ventasHoy = await this.prisma.venta.findMany({
      where: { estado: 'COMPLETADA', metodo_pago: 'EFECTIVO', created_at: { gte: hoy, lt: manana } },
    });

    const totalVentas = ventasHoy.reduce((s, v) => s + Number(v.total), 0);
    const diferencia = dto.efectivo_declarado - totalVentas;

    // Verificar que no haya un cierre hoy
    const yaHayCierre = await this.prisma.cierreCaja.findFirst({
      where: { created_at: { gte: hoy, lt: manana } },
    });

    let cierre;
    if (yaHayCierre) {
      cierre = await this.prisma.cierreCaja.update({
        where: { id_cierre: yaHayCierre.id_cierre },
        data: { total_ventas: totalVentas, efectivo_declarado: dto.efectivo_declarado, diferencia, observacion: dto.observacion, id_usuario: userId },
      });
    } else {
      cierre = await this.prisma.cierreCaja.create({
        data: { id_usuario: userId, total_ventas: totalVentas, efectivo_declarado: dto.efectivo_declarado, diferencia, observacion: dto.observacion },
      });
    }

    return { success: true, data: { ...cierre, total_ventas: Number(cierre.total_ventas), efectivo_declarado: Number(cierre.efectivo_declarado), diferencia: Number(cierre.diferencia) } };
  }

  /**
   * Obtiene todos los cierres de caja con paginación.
   * @param pagination - Parámetros de paginación
   * @returns Resultado paginado con lista de cierres
   */
  async findAll(pagination: PaginationDto) {
    const result = await paginate(this.prisma.cierreCaja, pagination, {
      include: { usuario: { select: { id_usuario: true, nombre: true } } },
      orderBy: { created_at: 'desc' },
    });
    return { success: true, ...result };
  }

  /**
   * Obtiene el cierre de caja del día de hoy.
   * Incluye el total de ventas en efectivo, cantidad de ventas
   * y el cierre si existe.
   * @returns Información del día y cierre actual
   */
  async findToday() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const ultimoCierre = await this.prisma.cierreCaja.findFirst({
      where: { created_at: { gte: hoy, lt: manana } },
      include: { usuario: { select: { id_usuario: true, nombre: true } } },
      orderBy: { created_at: 'desc' },
    });

    const ventasHoy = await this.prisma.venta.findMany({
      where: { estado: 'COMPLETADA', metodo_pago: 'EFECTIVO', created_at: { gte: hoy, lt: manana } },
    });
    const totalVentas = ventasHoy.reduce((s, v) => s + Number(v.total), 0);

    return {
      success: true,
      data: {
        total_ventas_hoy: totalVentas,
        cantidad_ventas: ventasHoy.length,
        cierre_hoy: ultimoCierre ? { ...ultimoCierre, total_ventas: Number(ultimoCierre.total_ventas), efectivo_declarado: Number(ultimoCierre.efectivo_declarado), diferencia: Number(ultimoCierre.diferencia) } : null,
      },
    };
  }
}
