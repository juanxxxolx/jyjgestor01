/**
 * @fileoverview DTO para la actualización parcial de un producto.
 * Extiende CreateProductoDto haciendo todos sus campos opcionales.
 */
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductoDto } from './create-producto.dto';

export class UpdateProductoDto extends PartialType(CreateProductoDto) {}
