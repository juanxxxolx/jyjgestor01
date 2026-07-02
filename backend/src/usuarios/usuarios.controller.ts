import { Controller, Get, Patch, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll() {
    const usuarios = await this.prisma.usuario.findMany({
      select: { id_usuario: true, nombre: true, email: true, id_rol: true, activo: true, fecha_creacion: true },
      orderBy: { nombre: 'asc' },
    });
    return { success: true, data: usuarios };
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUsuarioDto) {
    const usuario = await this.prisma.usuario.update({
      where: { id_usuario: id },
      data: dto,
      select: { id_usuario: true, nombre: true, email: true, id_rol: true, activo: true },
    });
    return { success: true, data: usuario };
  }
}
