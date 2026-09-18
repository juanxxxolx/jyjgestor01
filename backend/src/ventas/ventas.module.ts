/**
 * @fileoverview Módulo de Ventas.
 * Agrupa el controlador y servicio de ventas para su registro en la aplicación.
 */
import { Module } from '@nestjs/common';
import { VentasController } from './ventas.controller';
import { VentasService } from './ventas.service';

@Module({
  controllers: [VentasController],
  providers: [VentasService],
})
export class VentasModule {}
