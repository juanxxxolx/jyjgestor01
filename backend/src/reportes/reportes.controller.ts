import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reportes')
export class ReportesController {
  constructor(private reportesService: ReportesService) {}

  @Get('ventas-por-fecha')
  ventasPorFecha(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.reportesService.ventasPorFecha(desde, hasta);
  }

  @Get('ventas-por-producto')
  ventasPorProducto(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.reportesService.ventasPorProducto(desde, hasta);
  }

  @Get('ventas-por-cliente')
  ventasPorCliente(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.reportesService.ventasPorCliente(desde, hasta);
  }

  @Get('ventas-diarias')
  ventasDiarias(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.reportesService.ventasDiarias(desde, hasta);
  }
}
