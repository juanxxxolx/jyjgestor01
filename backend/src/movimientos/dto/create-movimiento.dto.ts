/**
 * @fileoverview DTOs para la creación de movimientos de inventario.
 * Define el enumerado de tipos de movimiento y la estructura de datos
 * requerida para registrar un movimiento manual.
 */
import { IsInt, IsString, IsEnum, IsNumber, Min, Max, IsOptional, MaxLength, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Enumerado de tipos de movimiento de inventario.
 */
export enum TipoMovimiento {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA',
  AJUSTE = 'AJUSTE',
}

/**
 * DTO para la creación de un movimiento de inventario.
 */
export class CreateMovimientoDto {
  /** ID del producto afectado */
  @IsInt()
  @Min(1, { message: 'ID de producto inválido' })
  @Type(() => Number)
  id_producto: number;

  /** Tipo de movimiento (ENTRADA, SALIDA o AJUSTE) */
  @IsEnum(TipoMovimiento, { message: 'tipo_movimiento debe ser ENTRADA, SALIDA o AJUSTE' })
  tipo_movimiento: TipoMovimiento;

  /** Cantidad del movimiento */
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(999999999, { message: 'Cantidad excesiva' })
  @Type(() => Number)
  cantidad: number;

  /** Motivo o razón del movimiento */
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  motivo: string;

  /** ID opcional del cliente asociado */
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'ID de cliente inválido' })
  @Type(() => Number)
  id_cliente?: number;
}
