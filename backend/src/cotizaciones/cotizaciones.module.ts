/**
 * @fileoverview Módulo de Cotizaciones.
 * Agrupa el controlador y servicio de cotizaciones para su registro en la aplicación.
 */
import { Module } from '@nestjs/common';
import { CotizacionesController } from './cotizaciones.controller';
import { CotizacionesService } from './cotizaciones.service';

@Module({
  controllers: [CotizacionesController],
  providers: [CotizacionesService],
})
export class CotizacionesModule {}
