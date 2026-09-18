/**
 * @fileoverview Controlador del módulo de Precios Históricos.
 * Permite consultar el historial de cambios de precios de productos.
 * Todas las rutas requieren autenticación JWT.
 */
import { Controller, Get, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PreciosHistoricosService } from './precios-historicos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('precios-historicos')
export class PreciosHistoricosController {
  constructor(private preciosHistoricosService: PreciosHistoricosService) {}

  /**
   * Obtiene todos los precios históricos, opcionalmente filtrados por producto.
   * @param producto - ID del producto para filtrar
   * @returns Lista de precios históricos
   */
  @Get()
  findAll(@Query('producto') producto?: string) {
    const productoId = producto !== undefined && producto !== '' ? Number(producto) : undefined;
    return this.preciosHistoricosService.findAll(productoId);
  }

  /**
   * Obtiene el historial de precios de un producto específico.
   * @param id - ID del producto
   * @returns Historial de precios del producto
   */
  @Get('producto/:id')
  findByProducto(@Param('id', ParseIntPipe) id: number) {
    return this.preciosHistoricosService.findByProducto(id);
  }
}
