import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe, UseGuards, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { ClientesService } from './clientes.service';
import { ExportService } from '../common/services/export.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('clientes')
export class ClientesController {
  constructor(
    private clientesService: ClientesService,
    private exportService: ExportService,
  ) {}

  @Get('export')
  async export(@Res() res: Response) {
    const { data } = await this.clientesService.findAll('', { page: 1, limit: 10000 });
    const buffer = await this.exportService.generateExcel(
      'Clientes',
      [
        { header: 'Nombre', key: 'nombre', width: 30 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Teléfono', key: 'telefono', width: 15 },
        { header: 'Dirección', key: 'direccion', width: 35 },
        { header: 'Tipo', key: 'tipo_cliente', width: 15 },
        { header: 'Registro', key: 'fecha_registro', width: 20 },
      ],
      data.map((c: any) => ({
        nombre: c.nombre,
        email: c.email ?? '',
        telefono: c.telefono ?? '',
        direccion: c.direccion ?? '',
        tipo_cliente: c.tipo_cliente ?? '',
        fecha_registro: c.fecha_registro?.toISOString?.() ?? '',
      })),
    );
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=clientes-${Date.now()}.xlsx`);
    res.send(buffer);
  }

  @Post()
  create(@Body() dto: CreateClienteDto, @Req() req: any) {
    return this.clientesService.create(dto, req.user.id, req.user.nombre, req.ip);
  }

  @Get()
  findAll(@Query('search') search?: string, @Query() pagination?: PaginationDto) {
    return this.clientesService.findAll(search, pagination ?? {});
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClienteDto, @Req() req: any) {
    return this.clientesService.update(id, dto, req.user.id, req.user.nombre, req.ip);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.clientesService.remove(id, req.user.id, req.user.nombre, req.ip);
  }
}
