/**
 * @fileoverview Módulo de Cierres de Caja.
 * Agrupa el controlador y servicio de cierres de caja para su registro en la aplicación.
 */
import { Module } from '@nestjs/common';
import { CierresCajaController } from './cierres-caja.controller';
import { CierresCajaService } from './cierres-caja.service';

@Module({ controllers: [CierresCajaController], providers: [CierresCajaService] })
export class CierresCajaModule {}
