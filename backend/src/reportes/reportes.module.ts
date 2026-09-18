/**
 * @fileoverview Módulo de Reportes.
 * Agrupa el controlador y servicio de reportes para su registro en la aplicación.
 */
import { Module } from '@nestjs/common';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';

@Module({
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}
