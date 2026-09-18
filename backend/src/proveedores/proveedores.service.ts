/**
 * @fileoverview Servicio del módulo de Proveedores.
 * Contiene la lógica de negocio para crear, consultar, actualizar y eliminar proveedores.
 * Cada operación crítica registra un log de auditoría.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';

@Injectable()
export class ProveedoresService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  /**
   * Crea un nuevo proveedor.
   * @param dto - Datos del proveedor
   * @param userId - ID del usuario que crea
   * @param userName - Nombre del usuario para auditoría
   * @param ip - Dirección IP para auditoría
   * @returns Proveedor creado
   */
  async create(dto: CreateProveedorDto, userId: number, userName?: string, ip?: string) {
    const proveedor = await this.prisma.proveedor.create({ data: dto });
    this.audit.log({ userId, userName, ip, action: 'Creó proveedor', entity: 'Proveedor', entityId: proveedor.id_proveedor, detail: proveedor.nombre });
    return { success: true, data: proveedor };
  }

  /**
   * Obtiene todos los proveedores ordenados por nombre ascendente.
   * @returns Lista de proveedores
   */
  async findAll() {
    const data = await this.prisma.proveedor.findMany({ orderBy: { nombre: 'asc' } });
    return { success: true, data };
  }

  /**
   * Obtiene un proveedor por su ID.
   * @param id - ID del proveedor
   * @returns Proveedor encontrado
   */
  async findOne(id: number) {
    const proveedor = await this.prisma.proveedor.findUnique({ where: { id_proveedor: id } });
    if (!proveedor) throw new NotFoundException('Proveedor no encontrado');
    return { success: true, data: proveedor };
  }

  /**
   * Actualiza los datos de un proveedor existente.
   * @param id - ID del proveedor a actualizar
   * @param dto - Datos actualizados
   * @param userId - ID del usuario que actualiza
   * @param userName - Nombre del usuario para auditoría
   * @param ip - Dirección IP para auditoría
   * @returns Proveedor actualizado
   */
  async update(id: number, dto: UpdateProveedorDto, userId: number, userName?: string, ip?: string) {
    await this.findOne(id);
    const proveedor = await this.prisma.proveedor.update({ where: { id_proveedor: id }, data: dto });
    this.audit.log({ userId, userName, ip, action: 'Editó proveedor', entity: 'Proveedor', entityId: id, detail: proveedor.nombre });
    return { success: true, data: proveedor };
  }

  /**
   * Elimina un proveedor por su ID.
   * @param id - ID del proveedor a eliminar
   * @param userId - ID del usuario que elimina
   * @param userName - Nombre del usuario para auditoría
   * @param ip - Dirección IP para auditoría
   * @returns Mensaje de confirmación
   */
  async remove(id: number, userId: number, userName?: string, ip?: string) {
    await this.findOne(id);
    await this.prisma.proveedor.delete({ where: { id_proveedor: id } });
    this.audit.log({ userId, userName, ip, action: 'Eliminó proveedor', entity: 'Proveedor', entityId: id });
    return { success: true, message: 'Proveedor eliminado' };
  }
}
