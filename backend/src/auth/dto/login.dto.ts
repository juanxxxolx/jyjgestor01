/**
 * @fileoverview DTO para la solicitud de inicio de sesión.
 * Valida que el email tenga formato correcto y la contraseña
 * cumpla con la longitud mínima requerida.
 */
import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class LoginDto {
  /** Email del usuario registrado */
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  @Matches(/^\S+$/, { message: 'El email no puede contener espacios' })
  email: string;

  /** Contraseña del usuario (mínimo 8 caracteres) */
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^\S+$/, { message: 'La contraseña no puede contener espacios' })
  password: string;
}
