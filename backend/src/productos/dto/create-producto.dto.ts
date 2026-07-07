import { IsString, IsNumber, IsOptional, IsInt, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductoDto {
  @IsString()
  @MaxLength(200)
  nombre: string;

  @IsString()
  @MaxLength(100)
  referencia: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  precio_venta: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  stock?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  stock_minimo?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id_categoria?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imagen_url?: string;
}
