/**
 * @fileoverview Módulo de Precios Históricos.
 * Agrupa el controlador y servicio de precios históricos para su registro en la aplicación.
 */
import { Module } from '@nestjs/common';
import { PreciosHistoricosController } from './precios-historicos.controller';
import { PreciosHistoricosService } from './precios-historicos.service';

@Module({
  controllers: [PreciosHistoricosController],
  providers: [PreciosHistoricosService],
})
export class PreciosHistoricosModule {}
