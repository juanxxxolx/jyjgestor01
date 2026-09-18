/**
 * @fileoverview Módulo de Exportación.
 * Módulo global que provee el servicio de exportación a Excel
 * a toda la aplicación. Exporta ExportService para ser utilizado por otros módulos.
 */
import { Global, Module } from '@nestjs/common';
import { ExportService } from './export.service';

@Global()
@Module({
  providers: [ExportService],
  exports: [ExportService],
})
export class ExportModule {}
