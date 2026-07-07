import { PaginationDto, PaginatedResult } from '../dto/pagination.dto';

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
