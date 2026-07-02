import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateClienteDto, userId: number) {
    const cliente = await this.prisma.cliente.create({
      data: { ...dto, id_usuario: userId },
    });
    return { success: true, data: cliente };
  }

  async findAll(search?: string) {
    const clientes = await this.prisma.cliente.findMany({
      where: search
        ? {
            OR: [
              { nombre: { contains: search } },
              { email: { contains: search } },
              { telefono: { contains: search } },
            ],
          }
        : undefined,
      orderBy: { nombre: 'asc' },
    });
    return { success: true, data: clientes };
  }

  async findOne(id: number) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id_cliente: id } });
    if (!cliente) throw new NotFoundException(`Cliente ${id} no encontrado`);
    return { success: true, data: cliente };
  }

  async update(id: number, dto: UpdateClienteDto) {
    await this.findOne(id);
    const cliente = await this.prisma.cliente.update({ where: { id_cliente: id }, data: dto });
    return { success: true, data: cliente };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.cliente.delete({ where: { id_cliente: id } });
    return { success: true, message: 'Cliente eliminado' };
  }
}
