/**
 * @fileoverview DTO para la creación de un nuevo producto.
 * Valida nombre, referencia única, precio de venta (entero en COP),
 * stock, stock mínimo, categoría opcional e imagen opcional.
 */
import {
  IsString, IsInt, IsOptional, Min, Max, MaxLength, MinLength, Matches,
  Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface,
} from 'class-validator';
import { Type } from 'class-transformer';

/** Valida que el stock inicial no sea menor que el stock mínimo. */
@ValidatorConstraint({ name: 'stockMayorOIgualMinimo', async: false })
export class StockMayorOIgualMinimoConstraint implements ValidatorConstraintInterface {
  validate(stock: number | undefined, args: ValidationArguments) {
    const dto = args.object as CreateProductoDto;
    return (stock ?? 0) >= (dto.stock_minimo ?? 0);
  }

  defaultMessage() {
    return 'El stock inicial no puede ser menor que el stock mínimo';
  }
}

export class CreateProductoDto {
  /** Nombre del producto (máximo 200 caracteres) */
  @IsString()
  @MaxLength(200)
  @MinLength(1)
  nombre: string;

  /** Código único del producto (solo números, máximo 20 dígitos) */
  @IsString()
  @MaxLength(20)
  @MinLength(1)
  @Matches(/^[0-9]+$/, {
    message: 'El código debe contener solo números',
  })
  codigo: string;

  /** Precio de venta en Pesos Colombianos (entero, sin decimales) */
  @IsInt({ message: 'El precio debe ser un número entero (sin decimales)' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  @Max(9999999999, { message: 'Precio excesivo' })
  @Type(() => Number)
  precio_venta: number;

  /** Cantidad en stock (opcional, por defecto 0) */
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9999999, { message: 'Stock excesivo' })
  @Validate(StockMayorOIgualMinimoConstraint)
  @Type(() => Number)
  stock?: number;

  /** Stock mínimo para alertas (opcional, por defecto 0) */
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9999999, { message: 'Stock mínimo excesivo' })
  @Type(() => Number)
  stock_minimo?: number;

  /** ID de la categoría del producto (opcional) */
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'ID de categoría inválido' })
  @Type(() => Number)
  id_categoria?: number;

  /** URL de la imagen del producto (opcional, máximo 500 caracteres) */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Matches(/^(\/uploads\/[a-zA-Z0-9\-_.]+\.(jpg|jpeg|png|webp|gif)|)$/, { message: 'URL de imagen no válida' })
  imagen_url?: string;
}
