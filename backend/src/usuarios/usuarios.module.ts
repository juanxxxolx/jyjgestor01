/**
 * @fileoverview Módulo de administración de usuarios.
 * Importa el controlador de usuarios para exponer los endpoints
 * de gestión de usuarios del sistema.
 */
import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [UsuariosController],
})
export class UsuariosModule {}
