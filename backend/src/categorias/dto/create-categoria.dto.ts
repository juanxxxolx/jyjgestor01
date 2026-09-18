/**
 * @fileoverview DTO para la creación de una nueva categoría.
 * Valida que el nombre sea una cadena de máximo 100 caracteres.
 */
import { IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class CreateCategoriaDto {
  /** Nombre de la categoría (máximo 100 caracteres) */
  @IsString()
  @MaxLength(100)
  @MinLength(1)
  @Matches(/^[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ\s\-']+$/, {
    message: 'El nombre solo debe contener letras, espacios, guiones y apóstrofes',
  })
  nombre_categoria: string;
}
