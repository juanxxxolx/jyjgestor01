import { Controller, Get, Patch, Param, Body, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { IsOptional, IsBoolean, IsInt } from 'class-validator';

class UpdateUsuarioDto {
  @IsOptional()
  @IsInt()
  id_rol?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(1)
@Controller('usuarios')
export class UsuariosController {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  @Get()
  async findAll() {
    const usuarios = await this.prisma.usuario.findMany({
      select: { id_usuario: true, nombre: true, email: true, id_rol: true, activo: true, fecha_creacion: true },
      orderBy: { nombre: 'asc' },
    });
    return { success: true, data: usuarios };
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUsuarioDto, @Req() req: any) {
    const before = await this.prisma.usuario.findUnique({ where: { id_usuario: id } });

    const usuario = await this.prisma.usuario.update({
      where: { id_usuario: id },
      data: dto,
      select: { id_usuario: true, nombre: true, email: true, id_rol: true, activo: true },
    });

    const cambios: string[] = [];
    if (dto.id_rol !== undefined && dto.id_rol !== before?.id_rol) cambios.push(`rol: ${before?.id_rol} → ${dto.id_rol}`);
    if (dto.activo !== undefined && dto.activo !== before?.activo) cambios.push(`activo: ${before?.activo} → ${dto.activo}`);

    this.audit.log({
      userId: req.user.id, userName: req.user.nombre, ip: req.ip,
      action: 'Editó usuario',
      entity: 'Usuario', entityId: id,
      detail: `${usuario.nombre} — ${cambios.join(', ')}`,
    });

    return { success: true, data: usuario };
  }
}
