/**
 * @fileoverview Módulo de Auditoría.
 * Módulo global que provee el servicio de auditoría a toda la aplicación.
 * Exporta AuditService para ser utilizado por otros módulos.
 */
import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';

@Global()
@Module({
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
