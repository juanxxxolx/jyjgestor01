/**
 * @fileoverview Controlador del módulo de Auditoría.
 * Proporciona acceso a los logs de auditoría del sistema.
 * Restringido a usuarios con rol de administrador (rol 1).
 */
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(1)
@Controller('audit-logs')
export class AuditController {
  constructor(private auditService: AuditService) {}

  /**
   * Obtiene todos los logs de auditoría con paginación y filtros opcionales.
   * @param fechaDesde - Fecha inicio (ISO string)
   * @param fechaHasta - Fecha fin (ISO string)
   * @param pagination - Parámetros de paginación
   * @returns Resultado paginado con logs de auditoría
   */
  @Get()
  async findAll(
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query() pagination?: PaginationDto,
  ) {
    const result = await this.auditService.findAll(pagination, fechaDesde, fechaHasta);
    return { success: true, ...result };
  }
}
