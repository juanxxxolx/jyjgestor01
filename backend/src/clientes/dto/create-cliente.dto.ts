/**
 * @fileoverview DTO para la creación de un nuevo cliente.
 * Valida que todos los campos sean obligatorios y cumplan formato estricto.
 */
import { IsString, IsEmail, MaxLength, MinLength, Matches } from 'class-validator';

export class CreateClienteDto {
  /** Nombre completo del cliente (máximo 200 caracteres) */
  @IsString()
  @MaxLength(200)
  @MinLength(1)
  @Matches(/^[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ\s\-']+$/, {
    message: 'El nombre solo debe contener letras, espacios, guiones y apóstrofes',
  })
  @Matches(/\S/, { message: 'El nombre no puede estar vacío ni contener solo espacios' })
  nombre: string;

  /** Email del cliente (obligatorio) */
  @IsEmail({}, { message: 'Email no válido' })
  @MaxLength(100)
  @Matches(/^\S+$/, { message: 'El email no debe contener espacios' })
  email: string;

  /** Número de teléfono (obligatorio, exactamente 10 dígitos numéricos) */
  @IsString()
  @MinLength(10)
  @MaxLength(10)
  @Matches(/^[0-9]{10}$/, {
    message: 'El teléfono debe tener exactamente 10 dígitos numéricos',
  })
  telefono: string;

  /** Dirección del cliente (obligatoria, máximo 300 caracteres) */
  @IsString()
  @MaxLength(300)
  @MinLength(1)
  @Matches(/\S/, { message: 'La dirección no puede estar vacía ni contener solo espacios' })
  direccion: string;
}
