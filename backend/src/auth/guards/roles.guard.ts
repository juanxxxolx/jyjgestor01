/**
 * @fileoverview Guard de autorización basado en roles.
 * Verifica que el usuario autenticado tenga uno de los roles
 * requeridos para acceder a un endpoint. Los roles requeridos
 * se definen mediante el decorador @Roles.
 */
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Determina si el usuario tiene permiso para acceder al recurso.
   *
   * @param context - Contexto de ejecución de la solicitud HTTP
   * @returns true si el usuario tiene un rol permitido o no hay roles requeridos
   * @throws ForbiddenException si el usuario no tiene el rol requerido
   */
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<number[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!requiredRoles.includes(user.rol)) {
      throw new ForbiddenException('No tienes permisos para esta acción');
    }
    return true;
  }
}
