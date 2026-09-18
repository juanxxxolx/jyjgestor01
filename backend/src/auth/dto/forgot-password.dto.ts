/**
 * @fileoverview DTO para la solicitud de recuperación de contraseña.
 * Solo requiere el email del usuario registrado.
 */
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  /** Email del usuario para enviar el enlace de recuperación */
  @IsEmail({}, { message: 'Email no válido' })
  email: string;
}
