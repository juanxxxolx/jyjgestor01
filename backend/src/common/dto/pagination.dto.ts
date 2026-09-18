/**
 * @fileoverview DTOs para paginación de resultados.
 * Define los parámetros de consulta para paginación y búsqueda,
 * así como la interfaz genérica para resultados paginados.
 */
import { IsOptional, IsInt, IsString, Min, Max, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para parámetros de paginación en endpoints GET.
 */
export class PaginationDto {
  /** Número de página (por defecto 1) */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  /** Cantidad de registros por página (por defecto 20, máximo 10000) */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  @Type(() => Number)
  limit?: number = 20;

  /** Término de búsqueda opcional */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;

  /** ID de producto para filtrar */
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'ID de producto inválido' })
  @Type(() => Number)
  producto?: number;
}

/**
 * Interfaz genérica para resultados paginados.
 */
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
