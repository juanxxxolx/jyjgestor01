/**
 * @fileoverview Controlador de administración de usuarios.
 * Permite listar, exportar, actualizar y eliminar usuarios.
 * Todos los endpoints requieren autenticación JWT y rol de administrador (1).
 * Incluye un DTO interno UpdateUsuarioDto para la actualización parcial de usuarios.
 */
import { Controller, Get, Patch, Delete, Param, Body, ParseIntPipe, UseGuards, Req, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ExportService } from '../common/services/export.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { IsOptional, IsBoolean, IsInt, IsString, Min, MinLength, IsEmail, MaxLength, Matches } from 'class-validator';

/**
 * DTO para actualización parcial de usuarios desde el controlador.
 */
class UpdateUsuarioDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsEmail()
  @Matches(/^\S+$/, { message: 'El email no debe contener espacios' })
  email?: string;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Rol inválido' })
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
    private exportService: ExportService,
  ) {}

  /**
   * Exporta la lista de usuarios a un archivo Excel.
   *
   * @param res - Objeto de respuesta HTTP para enviar el archivo
   */
  @Get('export')
  async export(@Res() res: Response) {
    const usuarios = await this.prisma.usuario.findMany({
      select: { id_usuario: true, nombre: true, email: true, id_rol: true, activo: true, fecha_creacion: true },
      orderBy: { nombre: 'asc' },
    });
    const buffer = await this.exportService.generateExcel(
      'Usuarios',
      [
        { header: 'ID', key: 'id', width: 8 },
        { header: 'Nombre', key: 'nombre', width: 30 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Rol', key: 'rol', width: 10 },
        { header: 'Activo', key: 'activo', width: 10 },
        { header: 'Registro', key: 'fecha', width: 20 },
      ],
      usuarios.map((u: any) => ({
        id: u.id_usuario,
        nombre: u.nombre,
        email: u.email,
        rol: u.id_rol === 1 ? 'Admin' : 'Usuario',
        activo: u.activo ? 'Sí' : 'No',
        fecha: u.fecha_creacion?.toISOString?.() ?? '',
      })),
    );
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=usuarios-${Date.now()}.xlsx`);
    res.send(buffer);
  }

  /**
   * Obtiene todos los usuarios registrados.
   *
   * @returns Lista de usuarios con datos seleccionados
   */
  @Get()
  async findAll() {
    const usuarios = await this.prisma.usuario.findMany({
      select: { id_usuario: true, nombre: true, email: true, id_rol: true, activo: true, fecha_creacion: true },
      orderBy: { nombre: 'asc' },
    });
    return { success: true, data: usuarios };
  }

  /**
   * Actualiza los datos de un usuario.
   * Registra los cambios en el log de auditoría.
   *
   * @param id - ID del usuario a actualizar
   * @param dto - Datos a actualizar (nombre, email, rol, activo)
   * @param req - Objeto de solicitud HTTP (contiene usuario autenticado e IP)
   * @returns Usuario actualizado
   */
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

  /**
   * Elimina un usuario del sistema.
   *
   * @param id - ID del usuario a eliminar
   * @param req - Objeto de solicitud HTTP
   * @returns Mensaje de confirmación de eliminación
   * @throws NotFoundException si el usuario no existe
   */
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id_usuario: id } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    await this.prisma.usuario.delete({ where: { id_usuario: id } });

    this.audit.log({
      userId: req.user.id, userName: req.user.nombre, ip: req.ip,
      action: 'Eliminó usuario',
      entity: 'Usuario', entityId: id,
      detail: usuario.nombre,
    });

    return { success: true, message: 'Usuario eliminado' };
  }
}
