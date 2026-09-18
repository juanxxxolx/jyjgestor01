/**
 * @fileoverview DTO para el registro de nuevos usuarios.
 * Valida nombre, email y contraseña con requisitos de seguridad
 * (mayúscula, minúscula, número, símbolo especial).
 */
import { IsEmail, IsString, MinLength, MaxLength, Matches, IsOptional, IsInt, Min } from 'class-validator';

export class RegisterDto {
  /** Nombre completo del usuario (3-100 caracteres) */
  @IsString()
  @MinLength(3, { message: 'Nombre mínimo 3 caracteres' })
  @MaxLength(100)
  @Matches(/^\S.*\S$|^\S$/, { message: 'El nombre no puede empezar o terminar con espacios' })
  nombre: string;

  /** Email del usuario */
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  @Matches(/^\S+$/, { message: 'El email no puede contener espacios' })
  email: string;

  /** Contraseña (mínimo 8 caracteres, al menos una mayúscula, minúscula, número y símbolo) */
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^\S+$/, { message: 'La contraseña no puede contener espacios' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'La contraseña debe tener mayúscula, minúscula, número y símbolo (@$!%*?&)',
  })
  password: string;

  /** ID del rol del usuario (opcional, por defecto 2 = usuario normal) */
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Rol inválido' })
  id_rol?: number;
}
