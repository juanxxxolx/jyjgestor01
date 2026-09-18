/**
 * @fileoverview DTO para la creación de cierres de caja.
 * Define la estructura de datos requerida para registrar un cierre de caja.
 */
import { IsOptional, IsNumber, IsString, Min, Max, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para crear o actualizar un cierre de caja.
 */
export class CreateCierreDto {
  /** Monto de efectivo declarado en caja */
  @IsNumber() @Min(0) @Max(999999999, { message: 'Monto excesivo' }) @Type(() => Number) efectivo_declarado: number;

  /** Observación opcional sobre el cierre */
  @IsOptional() @IsString() @MaxLength(500) observacion?: string;
}
