import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { paginate } from '../common/utils/pagination';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

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

  async findAll(pagination: PaginationDto) {
    return paginate(this.prisma.auditLog, pagination, {
      orderBy: { created_at: 'desc' },
    });
  }
}
