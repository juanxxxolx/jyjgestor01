/**
 * @fileoverview Controlador del módulo de Ventas.
 * Gestiona las operaciones CRUD de ventas, generación de PDF y anulación de ventas.
 * Todas las rutas requieren autenticación JWT.
 */
import { Controller, Get, Post, Patch, Body, Param, Query, ParseIntPipe, UseGuards, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('ventas')
export class VentasController {
  constructor(private ventasService: VentasService) {}

  /**
   * Crea una nueva venta con sus detalles.
   * @param dto - Datos de la venta (cliente opcional y lista de productos)
   * @param req - Objeto de solicitud HTTP (contiene usuario y IP)
   * @returns Venta creada con detalles, cliente y usuario
   */
  @Post()
  create(@Body() dto: CreateVentaDto, @Req() req: any) {
    return this.ventasService.create(dto, req.user.id, req.user.nombre, req.ip);
  }

  /**
   * Obtiene todas las ventas con paginación.
   * @param pagination - Parámetros de paginación (page, limit, search)
   * @returns Lista paginada de ventas
   */
  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.ventasService.findAll(pagination);
  }

  /**
   * Obtiene una venta por su ID.
   * @param id - ID de la venta
   * @returns Venta encontrada con todos sus detalles
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ventasService.findOne(id);
  }

  /**
   * Genera y descarga un PDF con la factura de una venta.
   * @param id - ID de la venta
   * @param res - Objeto de respuesta HTTP para enviar el PDF
   */
  @Get(':id/pdf')
  async pdf(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const buffer = await this.ventasService.generatePdf(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=factura-${id}.pdf`);
    res.send(buffer);
  }

  /**
   * Anula una venta (solo rol administrador).
   * Restituye el stock de los productos y registra un movimiento de entrada.
   * @param id - ID de la venta a anular
   * @param req - Objeto de solicitud HTTP
   * @returns Mensaje de confirmación de anulación
   */
  @UseGuards(RolesGuard)
  @Roles(1)
  @Patch(':id/anular')
  anular(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.ventasService.anular(id, req.user.id, req.user.nombre, req.ip);
  }
}
