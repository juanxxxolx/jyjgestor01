/**
 * @fileoverview Controlador del módulo de Clientes.
 * Gestiona las operaciones CRUD de clientes y exportación a Excel.
 * Todas las rutas requieren autenticación JWT.
 */
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe, UseGuards, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { ClientesService } from './clientes.service';
import { ExportService } from '../common/services/export.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('clientes')
export class ClientesController {
  constructor(
    private clientesService: ClientesService,
    private exportService: ExportService,
  ) {}

  /**
   * Exporta la lista de clientes a un archivo Excel.
   *
   * @param res - Objeto de respuesta HTTP para enviar el archivo
   */
  @Get('export')
  async export(@Res() res: Response) {
    const { data } = await this.clientesService.findAll('', { page: 1, limit: 10000 });
    const buffer = await this.exportService.generateExcel(
      'Clientes',
      [
        { header: 'Nombre', key: 'nombre', width: 30 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Teléfono', key: 'telefono', width: 15 },
        { header: 'Dirección', key: 'direccion', width: 35 },
        { header: 'Tipo', key: 'tipo_cliente', width: 15 },
        { header: 'Registro', key: 'fecha_registro', width: 20 },
      ],
      data.map((c: any) => ({
        nombre: c.nombre,
        email: c.email ?? '',
        telefono: c.telefono ?? '',
        direccion: c.direccion ?? '',
        tipo_cliente: c.tipo_cliente ?? '',
        fecha_registro: c.fecha_registro?.toISOString?.() ?? '',
      })),
    );
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=clientes-${Date.now()}.xlsx`);
    res.send(buffer);
  }

  /**
   * Crea un nuevo cliente.
   *
   * @param dto - Datos del cliente a crear
   * @param req - Objeto de solicitud HTTP (contiene usuario e IP)
   * @returns Cliente creado
   */
  @Post()
  create(@Body() dto: CreateClienteDto, @Req() req: any) {
    return this.clientesService.create(dto, req.user.id, req.user.nombre, req.ip);
  }

  /**
   * Obtiene todos los clientes con paginación y búsqueda opcional.
   *
   * @param search - Término de búsqueda (nombre, email, teléfono)
   * @param pagination - Parámetros de paginación
   * @returns Lista paginada de clientes
   */
  @Get()
  findAll(@Query('search') search?: string, @Query() pagination?: PaginationDto) {
    return this.clientesService.findAll(search, pagination ?? {});
  }

  /**
   * Obtiene un cliente por su ID.
   *
   * @param id - ID del cliente
   * @returns Cliente encontrado
   * @throws NotFoundException si el cliente no existe
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.findOne(id);
  }

  /**
   * Actualiza los datos de un cliente.
   *
   * @param id - ID del cliente
   * @param dto - Datos a actualizar
   * @param req - Objeto de solicitud HTTP
   * @returns Cliente actualizado
   */
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClienteDto, @Req() req: any) {
    return this.clientesService.update(id, dto, req.user.id, req.user.nombre, req.ip);
  }

  /**
   * Elimina un cliente del sistema.
   *
   * @param id - ID del cliente
   * @param req - Objeto de solicitud HTTP
   * @returns Mensaje de confirmación de eliminación
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.clientesService.remove(id, req.user.id, req.user.nombre, req.ip);
  }
}
