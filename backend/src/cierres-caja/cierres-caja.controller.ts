/**
 * @fileoverview Controlador del módulo de Cierres de Caja.
 * Gestiona la creación, consulta paginada y consulta del cierre del día actual.
 * Todas las rutas requieren autenticación JWT.
 */
import { Controller, Post, Get, Body, Query, UseGuards, Req } from '@nestjs/common';
import { CierresCajaService } from './cierres-caja.service';
import { CreateCierreDto } from './dto/create-cierre.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('cierres-caja')
export class CierresCajaController {
  constructor(private service: CierresCajaService) {}

  /**
   * Crea o actualiza el cierre de caja del día.
   * Calcula el total de ventas en efectivo del día y la diferencia con lo declarado.
   * @param dto - Datos del cierre (efectivo declarado y observación opcional)
   * @param req - Objeto de solicitud HTTP
   * @returns Cierre de caja registrado
   */
  @Post()
  create(@Body() dto: CreateCierreDto, @Req() req: any) { return this.service.create(dto, req.user.id); }

  /**
   * Obtiene todos los cierres de caja con paginación.
   * @param pagination - Parámetros de paginación
   * @returns Lista paginada de cierres
   */
  @Get()
  findAll(@Query() pagination: PaginationDto) { return this.service.findAll(pagination); }

  /**
   * Obtiene el cierre de caja del día de hoy.
   * Incluye el total de ventas en efectivo y la cantidad de ventas del día.
   * @returns Cierre del día (o null si no existe)
   */
  @Get('hoy')
  findToday() { return this.service.findToday(); }
}
