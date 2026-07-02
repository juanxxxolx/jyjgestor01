import { Controller, Get, Post, Body, Param, Query, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { MovimientosService } from './movimientos.service';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('movimientos')
export class MovimientosController {
  constructor(private movimientosService: MovimientosService) {}

  @Post()
  create(@Body() dto: CreateMovimientoDto, @Req() req: any) {
    return this.movimientosService.create(dto, req.user.id);
  }

  @Get()
  findAll(@Query('producto') productoId?: string) {
    return this.movimientosService.findAll(productoId ? parseInt(productoId) : undefined);
  }

  @Get('producto/:id')
  findByProducto(@Param('id', ParseIntPipe) id: number) {
    return this.movimientosService.findByProducto(id);
  }
}
