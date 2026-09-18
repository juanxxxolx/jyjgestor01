/**
 * @fileoverview Controlador del módulo de Movimientos de Inventario.
 * Gestiona el registro manual de movimientos (entradas, salidas, ajustes),
 * la consulta paginada y la exportación a Excel.
 * Todas las rutas requieren autenticación JWT.
 */
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

  /**
   * Exporta todos los movimientos a un archivo Excel.
   * @param res - Objeto de respuesta HTTP para enviar el archivo
   */
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

  /**
   * Crea un nuevo movimiento de inventario (entrada, salida o ajuste).
   * @param dto - Datos del movimiento
   * @param req - Objeto de solicitud HTTP
   * @returns Movimiento creado
   */
  @Post()
  create(@Body() dto: CreateMovimientoDto, @Req() req: any) {
    return this.movimientosService.create(dto, req.user.id, req.user.nombre, req.ip);
  }

  /**
   * Obtiene todos los movimientos con paginación y filtro opcional por producto.
   * @param producto - ID del producto para filtrar (opcional)
   * @param pagination - Parámetros de paginación
   * @returns Lista paginada de movimientos
   */
  @Get()
  findAll(@Query('producto') producto?: string, @Query() pagination?: PaginationDto) {
    const productoId = producto !== undefined && producto !== '' ? Number(producto) : undefined;
    return this.movimientosService.findAll(productoId, pagination ?? {});
  }

  /**
   * Obtiene los movimientos de un producto específico.
   * @param id - ID del producto
   * @param pagination - Parámetros de paginación
   * @returns Lista paginada de movimientos del producto
   */
  @Get('producto/:id')
  findByProducto(@Param('id', ParseIntPipe) id: number, @Query() pagination?: PaginationDto) {
    return this.movimientosService.findByProducto(id, pagination ?? {});
  }
}
