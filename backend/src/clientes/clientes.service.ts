import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { paginate } from '../common/utils/pagination';

@Injectable()
export class ClientesService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async create(dto: CreateClienteDto, userId: number, userName?: string, ip?: string) {
    const cliente = await this.prisma.cliente.create({
      data: { ...dto, id_usuario: userId },
    });

    this.audit.log({
      userId, userName, ip,
      action: 'Creó cliente',
      entity: 'Cliente', entityId: cliente.id_cliente,
      detail: cliente.nombre,
    });

    return { success: true, data: cliente };
  }

  async findAll(search: string | undefined, pagination: PaginationDto) {
    const where = search
      ? {
          OR: [
            { nombre: { contains: search } },
            { email: { contains: search } },
            { telefono: { contains: search } },
          ],
        }
      : undefined;

    const result = await paginate(this.prisma.cliente, pagination, {
      where,
      orderBy: { nombre: 'asc' },
    });
    return { success: true, ...result };
  }

  async findOne(id: number) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id_cliente: id } });
    if (!cliente) throw new NotFoundException(`Cliente ${id} no encontrado`);
    return { success: true, data: cliente };
  }

  async update(id: number, dto: UpdateClienteDto, userId?: number, userName?: string, ip?: string) {
    const anterior = await this.findOne(id);
    const cliente = await this.prisma.cliente.update({ where: { id_cliente: id }, data: dto });

    this.audit.log({
      userId, userName, ip,
      action: 'Editó cliente',
      entity: 'Cliente', entityId: id,
      detail: `${anterior.data.nombre} → ${cliente.nombre}`,
    });

    return { success: true, data: cliente };
  }

  async remove(id: number, userId?: number, userName?: string, ip?: string) {
    const cliente = await this.findOne(id);
    await this.prisma.cliente.delete({ where: { id_cliente: id } });

    this.audit.log({
      userId, userName, ip,
      action: 'Eliminó cliente',
      entity: 'Cliente', entityId: id,
      detail: cliente.data.nombre,
    });

    return { success: true, message: 'Cliente eliminado' };
  }
}
