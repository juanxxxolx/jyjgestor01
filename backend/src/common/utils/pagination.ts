/**
 * @fileoverview Utilidad de paginación para Prisma.
 * Proporciona una función genérica que aplica paginación
 * a cualquier modelo de Prisma mediante skip/take y conteo total.
 */
import { PaginationDto, PaginatedResult } from '../dto/pagination.dto';

/**
 * Ejecuta una consulta paginada sobre un modelo de Prisma.
 * Retorna los datos junto con metadatos de paginación (total, página, límite, páginas totales).
 *
 * @template T - Tipo de los datos retornados por el modelo
 * @param model - Objeto del modelo Prisma con métodos findMany y count
 * @param pagination - DTO con parámetros de paginación
 * @param args - Argumentos adicionales para la consulta (where, include, orderBy)
 * @returns Resultado paginado con datos y metadatos
 */
export async function paginate<T>(
  model: {
    findMany: (args: any) => Promise<T[]>;
    count: (args: { where?: any }) => Promise<number>;
  },
  pagination: PaginationDto,
  args: { where?: any; include?: any; orderBy?: any } = {},
): Promise<PaginatedResult<T>> {
  const page = pagination.page ?? 1;
  const limit = pagination.limit ?? 20;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.findMany({ ...args, skip, take: limit }),
    model.count({ where: args.where }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
