/**
 * @fileoverview DTOs para la creación y actualización de proveedores.
 * Define la estructura de datos de un proveedor con validaciones mediante class-validator.
 */
import { IsString, IsOptional, MinLength, IsEmail, MaxLength, Matches } from 'class-validator';

/**
 * DTO para crear un nuevo proveedor.
 */
export class CreateProveedorDto {
  /** Nombre del proveedor */
  @IsString()
  @MinLength(1)
  @MaxLength(200, { message: 'Máximo 200 caracteres' })
  nombre: string;

  /** Nombre de la persona de contacto */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contacto?: string;

  /** Número de teléfono del proveedor */
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[0-9\s\-\+\(\)]+$/, {
    message: 'El teléfono solo debe contener números, espacios, guiones, paréntesis y +',
  })
  telefono?: string;

  /** Correo electrónico del proveedor */
  @IsOptional()
  @IsEmail()
  @Matches(/^\S+$/, { message: 'El email no debe contener espacios' })
  email?: string;

  /** Dirección física del proveedor */
  @IsOptional()
  @IsString()
  @MaxLength(300)
  direccion?: string;
}
