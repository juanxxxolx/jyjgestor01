import { IsArray, IsInt, IsOptional, Min, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class DetalleVentaDto {
  @IsInt()
  id_producto: number;

  @IsInt()
  @Min(1)
  cantidad: number;
}

export class CreateVentaDto {
  @IsOptional()
  @IsInt()
  id_cliente?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DetalleVentaDto)
  detalle: DetalleVentaDto[];
}
