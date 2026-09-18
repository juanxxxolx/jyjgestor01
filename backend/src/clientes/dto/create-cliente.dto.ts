/**
 * @fileoverview DTO para la creación de un nuevo cliente.
 * Valida que el nombre sea obligatorio y que email, teléfono
 * y dirección sean opcionales.
 */
import { IsString, IsEmail, IsOptional, MaxLength, MinLength, Matches } from 'class-validator';

export class CreateClienteDto {
  /** Nombre completo del cliente (máximo 200 caracteres) */
  @IsString()
  @MaxLength(200)
  @MinLength(1)
  @Matches(/^[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ\s\-']+$/, {
    message: 'El nombre solo debe contener letras, espacios, guiones y apóstrofes',
  })
  nombre: string;

  /** Email del cliente (opcional) */
  @IsOptional()
  @IsEmail({}, { message: 'Email no válido' })
  @Matches(/^\S+$/, { message: 'El email no debe contener espacios' })
  email?: string;

  /** Número de teléfono (opcional, máximo 20 caracteres) */
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[0-9\s\-\+\(\)]+$/, {
    message: 'El teléfono solo debe contener números, espacios, guiones, paréntesis y +',
  })
  telefono?: string;

  /** Dirección del cliente (opcional, máximo 300 caracteres) */
  @IsOptional()
  @IsString()
  @MaxLength(300)
  direccion?: string;
}
