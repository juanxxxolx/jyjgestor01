/**
 * @fileoverview DTO para restablecer la contraseña usando un token.
 * Requiere el token de recuperación y la nueva contraseña con
 * requisitos de seguridad.
 */
import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  /** Token de recuperación de contraseña */
  @IsString()
  @MinLength(10, { message: 'Token inválido' })
  @MaxLength(512, { message: 'Token demasiado largo' })
  token: string;

  /** Nueva contraseña (mínimo 8 caracteres, mayúscula, minúscula, número y símbolo) */
  @IsString()
  @MinLength(8, { message: 'Contraseña mínimo 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'La contraseña debe tener mayúscula, minúscula, número y símbolo (@$!%*?&)',
  })
  password: string;
}
