/**
 * @fileoverview Módulo de Compras.
 * Agrupa el controlador y servicio de compras para su registro en la aplicación.
 */
import { Module } from '@nestjs/common';
import { ComprasController } from './compras.controller';
import { ComprasService } from './compras.service';

@Module({ controllers: [ComprasController], providers: [ComprasService] })
export class ComprasModule {}
