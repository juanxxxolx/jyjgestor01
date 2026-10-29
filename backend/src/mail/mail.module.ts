/**
 * @fileoverview Módulo global de correo electrónico.
 * Expone `MailService` a toda la aplicación sin necesidad de importarlo
 * en cada módulo.
 */
import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Global()
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
