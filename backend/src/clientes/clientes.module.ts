/**
 * @fileoverview Módulo de Clientes.
 * Importa y configura el controlador y servicio de clientes
 * para la gestión de clientes del sistema.
 */
import { Module } from '@nestjs/common';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';

@Module({
  controllers: [ClientesController],
  providers: [ClientesService],
})
export class ClientesModule {}
