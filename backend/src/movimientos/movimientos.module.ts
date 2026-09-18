/**
 * @fileoverview Módulo de Movimientos de Inventario.
 * Agrupa el controlador y servicio de movimientos para su registro en la aplicación.
 */
import { Module } from '@nestjs/common';
import { MovimientosController } from './movimientos.controller';
import { MovimientosService } from './movimientos.service';

@Module({
  controllers: [MovimientosController],
  providers: [MovimientosService],
})
export class MovimientosModule {}
