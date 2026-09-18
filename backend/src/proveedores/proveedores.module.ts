/**
 * @fileoverview Módulo de Proveedores.
 * Agrupa el controlador y servicio de proveedores para su registro en la aplicación.
 */
import { Module } from '@nestjs/common';
import { ProveedoresController } from './proveedores.controller';
import { ProveedoresService } from './proveedores.service';

@Module({ controllers: [ProveedoresController], providers: [ProveedoresService] })
export class ProveedoresModule {}
