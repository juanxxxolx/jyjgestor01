/**
 * @fileoverview Módulo de Abonos.
 * Agrupa el controlador y servicio de abonos para su registro en la aplicación.
 */
import { Module } from '@nestjs/common';
import { AbonosController } from './abonos.controller';
import { AbonosService } from './abonos.service';

@Module({ controllers: [AbonosController], providers: [AbonosService] })
export class AbonosModule {}
