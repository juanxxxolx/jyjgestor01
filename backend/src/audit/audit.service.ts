/**
 * @fileoverview Servicio del módulo de Auditoría.
 * Proporciona métodos para registrar logs de auditoría de las operaciones
 * del sistema y consultarlos con paginación.
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { paginate } from '../common/utils/pagination';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  /**
   * Registra un log de auditoría en la base de datos.
   * @param params - Objeto con los datos del log
   * @param params.userId - ID del usuario que realizó la acción
   * @param params.userName - Nombre del usuario
   * @param params.action - Descripción de la acción realizada
   * @param params.entity - Nombre de la entidad afectada
   * @param params.entityId - ID del registro afectado (opcional)
   * @param params.detail - Detalle adicional de la acción (opcional)
   * @param params.ip - Dirección IP del usuario (opcional)
   */
  async log(params: {
    userId?: number;
    userName: string;
    action: string;
    entity: string;
    entityId?: number;
    detail?: string;
    ip?: string;
  }) {
    await this.prisma.auditLog.create({
      data: {
        id_usuario: params.userId ?? null,
        usuario_nombre: params.userName,
        accion: params.action,
        entidad: params.entity,
        id_entidad: params.entityId ?? null,
        detalle: params.detail ?? null,
        ip: params.ip ?? null,
      },
    });
  }

  /**
   * Obtiene todos los logs de auditoría con paginación y filtro opcional por fecha.
   * @param pagination - Parámetros de paginación
   * @param fechaDesde - Fecha inicio (ISO string)
   * @param fechaHasta - Fecha fin (ISO string)
   * @returns Resultado paginado con logs de auditoría
   */
  async findAll(pagination: PaginationDto, fechaDesde?: string, fechaHasta?: string) {
    const where = fechaDesde || fechaHasta
      ? {
          created_at: {
            ...(fechaDesde && { gte: new Date(fechaDesde) }),
            ...(fechaHasta && { lte: new Date(fechaHasta) }),
          },
        }
      : undefined;

    return paginate(this.prisma.auditLog, pagination, {
      where,
      orderBy: { created_at: 'desc' },
    });
  }
}
