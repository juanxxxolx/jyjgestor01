import { IsInt, IsString, IsEnum, IsNumber, Min, IsOptional, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export enum TipoMovimiento {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA',
  AJUSTE = 'AJUSTE',
}

export class CreateMovimientoDto {
  @IsInt()
  @Type(() => Number)
  id_producto: number;

  @IsEnum(TipoMovimiento, { message: 'tipo_movimiento debe ser ENTRADA, SALIDA o AJUSTE' })
  tipo_movimiento: TipoMovimiento;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  cantidad: number;

  @IsString()
  @MaxLength(500)
  motivo: string;
}
