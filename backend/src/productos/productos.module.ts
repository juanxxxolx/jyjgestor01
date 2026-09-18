/**
 * @fileoverview Módulo de Productos.
 * Importa y configura el controlador y servicio de productos
 * para la gestión del catálogo de productos.
 */
import { Module } from '@nestjs/common';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';

@Module({
  controllers: [ProductosController],
  providers: [ProductosService],
})
export class ProductosModule {}
