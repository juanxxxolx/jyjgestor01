import { Controller, Get, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PreciosHistoricosService } from './precios-historicos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('precios-historicos')
export class PreciosHistoricosController {
  constructor(private preciosHistoricosService: PreciosHistoricosService) {}

  @Get()
  findAll(@Query('producto') productoId?: string) {
    return this.preciosHistoricosService.findAll(productoId ? parseInt(productoId) : undefined);
  }

  @Get('producto/:id')
  findByProducto(@Param('id', ParseIntPipe) id: number) {
    return this.preciosHistoricosService.findByProducto(id);
  }
}
