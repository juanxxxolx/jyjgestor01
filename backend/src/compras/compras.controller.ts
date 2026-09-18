/**
 * @fileoverview Controlador del módulo de Compras.
 * Gestiona las operaciones CRUD de compras. Todas las rutas requieren autenticación JWT.
 */
import { Controller, Get, Post, Body, Param, Query, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { ComprasService } from './compras.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('compras')
export class ComprasController {
  constructor(private comprasService: ComprasService) {}

  /**
   * Crea una nueva compra con sus detalles.
   * @param dto - Datos de la compra (proveedor opcional y detalle de productos)
   * @param req - Objeto de solicitud HTTP
   * @returns Compra creada
   */
  @Post()
  create(@Body() dto: CreateCompraDto, @Req() req: any) { return this.comprasService.create(dto, req.user.id, req.user.nombre, req.ip); }

  /**
   * Obtiene todas las compras con paginación.
   * @param pagination - Parámetros de paginación
   * @returns Lista paginada de compras
   */
  @Get()
  findAll(@Query() pagination: PaginationDto) { return this.comprasService.findAll(pagination); }

  /**
   * Obtiene una compra por su ID.
   * @param id - ID de la compra
   * @returns Compra encontrada
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.comprasService.findOne(id); }
}
