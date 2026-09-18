/**
 * @fileoverview Servicio del módulo de Abonos.
 * Contiene la lógica de negocio para registrar abonos de clientes
 * y actualizar su saldo pendiente mediante transacciones.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AbonosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Registra un abono y reduce el saldo del cliente en una transacción.
   * @param clienteId - ID del cliente
   * @param monto - Monto del abono
   * @returns Abono creado
   */
  async create(clienteId: number, monto: number) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id_cliente: clienteId } });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');

    const [abono] = await this.prisma.$transaction([
      this.prisma.abono.create({ data: { id_cliente: clienteId, monto } }),
      this.prisma.cliente.update({ where: { id_cliente: clienteId }, data: { saldo: { decrement: monto } } }),
    ]);
    return { success: true, data: abono };
  }

  /**
   * Obtiene todos los abonos de un cliente ordenados por fecha descendente.
   * @param clienteId - ID del cliente
   * @returns Lista de abonos del cliente
   */
  async findByCliente(clienteId: number) {
    const abonos = await this.prisma.abono.findMany({ where: { id_cliente: clienteId }, orderBy: { created_at: 'desc' } });
    return { success: true, data: abonos };
  }
}
