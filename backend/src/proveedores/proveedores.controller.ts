/**
 * @fileoverview Controlador del módulo de Proveedores.
 * Gestiona las operaciones CRUD de proveedores. Todas las rutas requieren autenticación JWT.
 */
import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('proveedores')
export class ProveedoresController {
  constructor(private proveedoresService: ProveedoresService) {}

  /**
   * Crea un nuevo proveedor.
   * @param dto - Datos del proveedor
   * @param req - Objeto de solicitud HTTP
   * @returns Proveedor creado
   */
  @Post()
  create(@Body() dto: CreateProveedorDto, @Req() req: any) {
    return this.proveedoresService.create(dto, req.user.id, req.user.nombre, req.ip);
  }

  /**
   * Obtiene todos los proveedores ordenados por nombre.
   * @returns Lista de proveedores
   */
  @Get()
  findAll() { return this.proveedoresService.findAll(); }

  /**
   * Obtiene un proveedor por su ID.
   * @param id - ID del proveedor
   * @returns Proveedor encontrado
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.proveedoresService.findOne(id); }

  /**
   * Actualiza un proveedor existente.
   * @param id - ID del proveedor a actualizar
   * @param dto - Datos actualizados del proveedor
   * @param req - Objeto de solicitud HTTP
   * @returns Proveedor actualizado
   */
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProveedorDto, @Req() req: any) {
    return this.proveedoresService.update(id, dto, req.user.id, req.user.nombre, req.ip);
  }

  /**
   * Elimina un proveedor por su ID.
   * @param id - ID del proveedor a eliminar
   * @param req - Objeto de solicitud HTTP
   * @returns Mensaje de confirmación
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.proveedoresService.remove(id, req.user.id, req.user.nombre, req.ip);
  }
}
