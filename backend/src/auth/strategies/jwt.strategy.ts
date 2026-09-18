/**
 * @fileoverview Estrategia JWT para Passport.
 * Extrae y valida el token JWT del encabezado Authorization
 * (Bearer token). Si el payload es válido, retorna los datos
 * del usuario que se inyectan en la solicitud.
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  /**
   * Valida el payload del token JWT.
   *
   * @param payload - Contenido del token decodificado
   * @returns Objeto con los datos del usuario autenticado
   * @throws UnauthorizedException si el payload no contiene un ID válido
   */
  async validate(payload: any) {
    if (!payload.id) throw new UnauthorizedException();
    return { id: payload.id, email: payload.email, nombre: payload.nombre, rol: payload.rol };
  }
}
