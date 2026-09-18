/**
 * @fileoverview Guard de autenticación JWT.
 * Extiende el AuthGuard de Passport con la estrategia 'jwt'.
 * Protege los endpoints que requieren un token JWT válido.
 */
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
