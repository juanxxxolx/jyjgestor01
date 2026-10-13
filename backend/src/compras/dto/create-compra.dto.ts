/**
 * @fileoverview DTOs para la creación de compras.
 * Define la estructura de datos requerida para registrar una compra,
 * incluyendo la validación de cada campo mediante class-validator.
 */
import { IsArray, IsOptional, IsInt, Min, Max, ArrayMinSize, ArrayMaxSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO que representa un producto dentro del detalle de la compra.
 */
class DetalleDto {
  /** ID del producto a comprar */
  @IsInt() @Min(1, { message: 'ID de producto inválido' }) id_producto: number;
  /** Cantidad del producto a comprar */
  @IsInt() @Min(1) cantidad: number;
  /** Costo unitario del producto en la compra (entero, sin decimales, en COP) */
  @IsInt({ message: 'El costo debe ser un número entero (sin decimales)' })
  @Min(0, { message: 'El costo no puede ser negativo' })
  @Max(9999999999, { message: 'Costo excesivo' })
  @Type(() => Number)
  costo_unitario: number;
}

/**
 * DTO para la creación de una compra.
 * Contiene el proveedor opcional y el detalle de productos adquiridos.
 */
export class CreateCompraDto {
  /** ID opcional del proveedor */
  @IsOptional() @IsInt() @Min(1, { message: 'ID de proveedor inválido' }) id_proveedor?: number;
  /** Lista de productos que conforman el detalle de la compra (mínimo 1) */
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(100, { message: 'Máximo 100 productos por compra' }) @ValidateNested({ each: true }) @Type(() => DetalleDto)
  detalle: DetalleDto[];
}
