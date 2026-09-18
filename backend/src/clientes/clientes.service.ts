/**
 * @fileoverview Servicio de Clientes.
 * Implementa la lógica de negocio para la gestión de clientes:
 * crear, listar (con paginación y búsqueda), obtener por ID,
 * actualizar y eliminar. Registra eventos de auditoría.
 */
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

  /**
   * Crea un nuevo cliente y registra el evento en auditoría.
   *
   * @param dto - Datos del cliente a crear
   * @param userId - ID del usuario que realiza la creación
   * @param userName - Nombre del usuario que realiza la creación
   * @param ip - Dirección IP del usuario
   * @returns Cliente creado
   */
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

  /**
   * Obtiene todos los clientes con paginación y búsqueda opcional.
   * La búsqueda filtra por nombre, email o teléfono.
   *
   * @param search - Término de búsqueda opcional
   * @param pagination - Parámetros de paginación
   * @returns Lista paginada de clientes
   */
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

  /**
   * Obtiene un cliente por su ID.
   *
   * @param id - ID del cliente
   * @returns Cliente encontrado
   * @throws NotFoundException si el cliente no existe
   */
  async findOne(id: number) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id_cliente: id } });
    if (!cliente) throw new NotFoundException(`Cliente ${id} no encontrado`);
    return { success: true, data: cliente };
  }

  /**
   * Actualiza los datos de un cliente y registra el cambio en auditoría.
   *
   * @param id - ID del cliente
   * @param dto - Datos a actualizar
   * @param userId - ID del usuario que realiza la actualización
   * @param userName - Nombre del usuario
   * @param ip - Dirección IP del usuario
   * @returns Cliente actualizado
   * @throws NotFoundException si el cliente no existe
   */
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

  /**
   * Elimina un cliente del sistema y registra el evento en auditoría.
   *
   * @param id - ID del cliente
   * @param userId - ID del usuario que realiza la eliminación
   * @param userName - Nombre del usuario
   * @param ip - Dirección IP del usuario
   * @returns Mensaje de confirmación
   * @throws NotFoundException si el cliente no existe
   */
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
