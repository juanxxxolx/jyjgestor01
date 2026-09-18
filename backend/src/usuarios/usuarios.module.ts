/**
 * @fileoverview Módulo de administración de usuarios.
 * Importa el controlador de usuarios para exponer los endpoints
 * de gestión de usuarios del sistema.
 */
import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';

@Module({
  controllers: [UsuariosController],
})
export class UsuariosModule {}
