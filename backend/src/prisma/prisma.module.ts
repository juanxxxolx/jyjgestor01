/**
 * @fileoverview Módulo global de Prisma ORM.
 * Provee y exporta PrismaService para que esté disponible
 * en todos los módulos de la aplicación sin necesidad de
 * importarlo explícitamente en cada uno.
 */
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
