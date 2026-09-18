/**
 * @fileoverview DTOs para la creación de cotizaciones.
 * Define la estructura de datos requerida para registrar una cotización,
 * incluyendo la validación de cada campo mediante class-validator.
 */
import { IsArray, IsInt, IsOptional, Min, ArrayMinSize, ArrayMaxSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO que representa un producto dentro del detalle de la cotización.
 */
class DetalleDto {
  /** ID del producto a cotizar */
  @IsInt()
  @Min(1, { message: 'ID de producto inválido' })
  id_producto: number;

  /** Cantidad del producto a cotizar */
  @IsInt()
  @Min(1)
  cantidad: number;
}

/**
 * DTO para la creación de una cotización.
 * Contiene el cliente opcional y el detalle de productos.
 */
export class CreateCotizacionDto {
  /** ID opcional del cliente */
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'ID de cliente inválido' })
  id_cliente?: number;

  /** Lista de productos que conforman el detalle (mínimo 1) */
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100, { message: 'Máximo 100 productos por cotización' })
  @ValidateNested({ each: true })
  @Type(() => DetalleDto)
  detalle: DetalleDto[];
}

/**
 * DTO para la actualización de una cotización.
 * Todos los campos son opcionales.
 */
export class UpdateCotizacionDto {
  /** ID opcional del cliente */
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'ID de cliente inválido' })
  id_cliente?: number;

  /** Lista de productos que conforman el detalle (mínimo 1 si se envía) */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100, { message: 'Máximo 100 productos por cotización' })
  @ValidateNested({ each: true })
  @Type(() => DetalleDto)
  detalle?: DetalleDto[];
}
