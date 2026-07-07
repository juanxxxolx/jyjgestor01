import { Controller, Get, Post, Body, Param, Query, ParseIntPipe, UseGuards, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { MovimientosService } from './movimientos.service';
import { ExportService } from '../common/services/export.service';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('movimientos')
export class MovimientosController {
  constructor(
    private movimientosService: MovimientosService,
    private exportService: ExportService,
  ) {}

  @Get('export')
  async export(@Res() res: Response) {
    const { data } = await this.movimientosService.findAll(undefined, { page: 1, limit: 10000 });
    const buffer = await this.exportService.generateExcel(
      'Movimientos',
      [
        { header: 'ID', key: 'id', width: 8 },
        { header: 'Producto', key: 'producto', width: 30 },
        { header: 'Tipo', key: 'tipo', width: 12 },
        { header: 'Cantidad', key: 'cantidad', width: 12 },
        { header: 'Motivo', key: 'motivo', width: 40 },
        { header: 'Cliente', key: 'cliente', width: 20 },
        { header: 'Usuario', key: 'usuario', width: 20 },
        { header: 'Fecha', key: 'fecha', width: 20 },
      ],
      data.map((m: any) => ({
        id: m.id_movimiento,
        producto: m.producto?.nombre ?? '',
        tipo: m.tipo_movimiento,
        cantidad: Number(m.cantidad),
        motivo: m.motivo,
        cliente: m.cliente?.nombre ?? '',
        usuario: m.usuario?.nombre ?? '',
        fecha: m.fecha_movimiento?.toISOString?.() ?? '',
      })),
    );
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=movimientos-${Date.now()}.xlsx`);
    res.send(buffer);
  }

  @Post()
  create(@Body() dto: CreateMovimientoDto, @Req() req: any) {
    return this.movimientosService.create(dto, req.user.id, req.user.nombre, req.ip);
  }

  @Get()
  findAll(@Query('producto') productoId?: string, @Query() pagination?: PaginationDto) {
    return this.movimientosService.findAll(productoId ? parseInt(productoId) : undefined, pagination ?? {});
  }

  @Get('producto/:id')
  findByProducto(@Param('id', ParseIntPipe) id: number, @Query() pagination?: PaginationDto) {
    return this.movimientosService.findByProducto(id, pagination ?? {});
  }
}
