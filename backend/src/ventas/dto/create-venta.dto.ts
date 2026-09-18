/**
 * @fileoverview DTOs para la creación de ventas.
 * Define la estructura de datos requerida para registrar una venta,
 * incluyendo la validación de cada campo mediante class-validator.
 */
import { IsArray, IsInt, IsOptional, Min, ArrayMinSize, ArrayMaxSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO que representa un producto dentro del detalle de la venta.
 */
class DetalleVentaDto {
  /** ID del producto a vender */
  @IsInt()
  @Min(1, { message: 'ID de producto inválido' })
  id_producto: number;

  /** Cantidad del producto a vender */
  @IsInt()
  @Min(1)
  cantidad: number;
}

/**
 * DTO para la creación de una venta.
 * Contiene la referencia opcional al cliente y el detalle de productos.
 */
export class CreateVentaDto {
  /** ID opcional del cliente asociado a la venta */
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'ID de cliente inválido' })
  id_cliente?: number;

  /** Lista de productos que conforman el detalle de la venta (mínimo 1) */
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100, { message: 'Máximo 100 productos por venta' })
  @ValidateNested({ each: true })
  @Type(() => DetalleVentaDto)
  detalle: DetalleVentaDto[];
}
