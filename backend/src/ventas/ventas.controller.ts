import { Controller, Get, Post, Patch, Body, Param, Query, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
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

  @Post()
  create(@Body() dto: CreateVentaDto, @Req() req: any) {
    return this.ventasService.create(dto, req.user.id, req.user.nombre, req.ip);
  }

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.ventasService.findAll(pagination);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ventasService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles(1)
  @Patch(':id/anular')
  anular(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.ventasService.anular(id, req.user.id, req.user.nombre, req.ip);
  }
}
