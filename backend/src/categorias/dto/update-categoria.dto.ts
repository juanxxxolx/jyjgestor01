/**
 * @fileoverview DTO para la actualización parcial de una categoría.
 * Extiende CreateCategoriaDto haciendo todos sus campos opcionales.
 */
import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriaDto } from './create-categoria.dto';

export class UpdateCategoriaDto extends PartialType(CreateCategoriaDto) {}
