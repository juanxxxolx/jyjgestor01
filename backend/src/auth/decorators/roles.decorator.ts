/**
 * @fileoverview Decorador para definir roles requeridos en un endpoint.
 * Utiliza SetMetadata para almacenar los roles en los metadatos del
 * handler, que luego son leídos por RolesGuard.
 */
import { SetMetadata } from '@nestjs/common';

/** Clave utilizada para almacenar los roles en los metadatos */
export const ROLES_KEY = 'roles';

/**
 * Asigna los roles que pueden acceder a un endpoint.
 *
 * @param roles - Lista de IDs de roles permitidos
 * @returns Decorador de método/clase con los metadatos de roles
 */
export const Roles = (...roles: number[]) => SetMetadata(ROLES_KEY, roles);
