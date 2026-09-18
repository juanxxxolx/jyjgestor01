/**
 * @fileoverview Controlador del módulo de Reportes.
 * Proporciona endpoints para obtener reportes de ventas agrupados
 * por fecha, producto, cliente y ventas diarias.
 * Todas las rutas requieren autenticación JWT.
 */
import { Controller, Get, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportesQueryDto } from './dto/reportes-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('reportes')
export class ReportesController {
  constructor(private reportesService: ReportesService) {}

  /**
   * Obtiene reporte de ventas filtrado por rango de fechas.
   * Incluye total de ventas, ingresos y ticket promedio.
   * @param desde - Fecha de inicio (YYYY-MM-DD)
   * @param hasta - Fecha de fin (YYYY-MM-DD)
   * @returns Reporte de ventas por fecha
   */
  @Get('ventas-por-fecha')
  ventasPorFecha(@Query(new ValidationPipe({ transform: true })) query: ReportesQueryDto) {
    return this.reportesService.ventasPorFecha(query.desde, query.hasta);
  }

  /**
   * Obtiene reporte de ventas agrupado por producto.
   * @param desde - Fecha de inicio (YYYY-MM-DD)
   * @param hasta - Fecha de fin (YYYY-MM-DD)
   * @returns Ventas agregadas por producto
   */
  @Get('ventas-por-producto')
  ventasPorProducto(@Query(new ValidationPipe({ transform: true })) query: ReportesQueryDto) {
    return this.reportesService.ventasPorProducto(query.desde, query.hasta);
  }

  /**
   * Obtiene reporte de ventas agrupado por cliente.
   * @param desde - Fecha de inicio (YYYY-MM-DD)
   * @param hasta - Fecha de fin (YYYY-MM-DD)
   * @returns Ventas agregadas por cliente
   */
  @Get('ventas-por-cliente')
  ventasPorCliente(@Query(new ValidationPipe({ transform: true })) query: ReportesQueryDto) {
    return this.reportesService.ventasPorCliente(query.desde, query.hasta);
  }

  /**
   * Obtiene reporte de ventas diarias en un rango de fechas.
   * @param desde - Fecha de inicio (YYYY-MM-DD)
   * @param hasta - Fecha de fin (YYYY-MM-DD)
   * @returns Ventas agregadas por día
   */
  @Get('ventas-diarias')
  ventasDiarias(@Query(new ValidationPipe({ transform: true })) query: ReportesQueryDto) {
    return this.reportesService.ventasDiarias(query.desde, query.hasta);
  }
}
