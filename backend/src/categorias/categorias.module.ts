/**
 * @fileoverview Módulo de Categorías.
 * Importa y configura el controlador y servicio de categorías
 * para la gestión de categorías de productos.
 */
import { Module } from '@nestjs/common';
import { CategoriasController } from './categorias.controller';
import { CategoriasService } from './categorias.service';

@Module({
  controllers: [CategoriasController],
  providers: [CategoriasService],
})
export class CategoriasModule {}
