/**
 * @fileoverview Controlador del módulo de Cotizaciones.
 * Gestiona la creación, consulta y conversión a venta de cotizaciones.
 * Todas las rutas requieren autenticación JWT.
 */
import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { CotizacionesService } from './cotizaciones.service';
import { CreateCotizacionDto, UpdateCotizacionDto } from './dto/create-cotizacion.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('cotizaciones')
export class CotizacionesController {
  constructor(private cotizacionesService: CotizacionesService) {}

  /**
   * Crea una nueva cotización.
   * @param dto - Datos de la cotización
   * @param req - Objeto de solicitud HTTP
   * @returns Cotización creada
   */
  @Post()
  create(@Body() dto: CreateCotizacionDto, @Req() req: any) {
    return this.cotizacionesService.create(dto, req.user.id);
  }

  /**
   * Obtiene todas las cotizaciones con paginación.
   * @param pagination - Parámetros de paginación
   * @returns Lista paginada de cotizaciones
   */
  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.cotizacionesService.findAll(pagination);
  }

  /**
   * Obtiene una cotización por su ID.
   * @param id - ID de la cotización
   * @returns Cotización encontrada
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cotizacionesService.findOne(id);
  }

  /**
   * Convierte una cotización pendiente en una venta.
   * Descuenta el stock y registra movimientos de salida.
   * @param id - ID de la cotización a convertir
   * @param req - Objeto de solicitud HTTP
   * @returns Mensaje de confirmación
   */
  @Post(':id/convertir')
  convertir(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.cotizacionesService.convertirAVenta(id, req.user.id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCotizacionDto, @Req() req: any) {
    return this.cotizacionesService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cotizacionesService.remove(id);
  }
}
