/**
 * @fileoverview Controlador del módulo de Abonos.
 * Gestiona el registro de abonos a clientes y la consulta de abonos por cliente.
 * Todas las rutas requieren autenticación JWT.
 */
import { Controller, Post, Get, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AbonosService } from './abonos.service';
import { CreateAbonoDto } from './dto/create-abono.dto';

@UseGuards(JwtAuthGuard)
@Controller('abonos')
export class AbonosController {
  constructor(private abonosService: AbonosService) {}

  /**
   * Registra un abono a un cliente y reduce su saldo pendiente.
   * @param body - Objeto con id_cliente y monto del abono
   * @returns Abono creado
   */
  @Post()
  create(@Body() createAbonoDto: CreateAbonoDto) {
    return this.abonosService.create(createAbonoDto.id_cliente, createAbonoDto.monto);
  }

  /**
   * Obtiene todos los abonos de un cliente específico.
   * @param id - ID del cliente
   * @returns Lista de abonos del cliente
   */
  @Get('cliente/:id')
  findByCliente(@Param('id', ParseIntPipe) id: number) {
    return this.abonosService.findByCliente(id);
  }
}
