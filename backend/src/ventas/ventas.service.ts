/**
 * @fileoverview Servicio del módulo de Ventas.
 * Contiene la lógica de negocio para crear ventas, consultar,
 * generar PDF de factura y anular ventas con restitución de stock.
 */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { paginate } from '../common/utils/pagination';

@Injectable()
export class VentasService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  /**
   * Crea una nueva venta con transacción.
   * Valida stock, descuenta inventario, registra movimientos y actualiza saldo del cliente.
   * @param dto - Datos de la venta (cliente opcional y detalle de productos)
   * @param userId - ID del usuario que registra la venta
   * @param userName - Nombre del usuario para auditoría
   * @param ip - Dirección IP del usuario para auditoría
   * @returns Venta creada con relaciones incluidas
   */
  async create(dto: CreateVentaDto, userId: number, userName?: string, ip?: string) {
    const productos = await this.prisma.producto.findMany({
      where: { id_producto: { in: dto.detalle.map((d) => d.id_producto) } },
    });

    const productosMap = new Map(productos.map((p) => [p.id_producto, p]));

    const detalleData = dto.detalle.map((item) => {
      const producto = productosMap.get(item.id_producto);
      if (!producto) throw new NotFoundException(`Producto ${item.id_producto} no encontrado`);
      if (producto.stock < item.cantidad) {
        throw new BadRequestException(`Stock insuficiente para "${producto.nombre}": disponible ${producto.stock}, requerido ${item.cantidad}`);
      }
      const precio_unitario = Number(producto.precio_venta);
      return {
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        precio_unitario,
        subtotal: precio_unitario * item.cantidad,
        producto,
      };
    });

    const total = detalleData.reduce((sum, d) => sum + d.subtotal, 0);
    const idCliente = dto.id_cliente ?? null;

    const venta = await this.prisma.$transaction(async (tx) => {
      if (idCliente) {
        await tx.cliente.update({ where: { id_cliente: idCliente }, data: { saldo: { increment: total }, ultimo_pedido: new Date() } });
      }
      const v = await tx.venta.create({
        data: {
          id_usuario: userId,
          id_cliente: dto.id_cliente ?? null,
          total,
          detalle: {
            create: detalleData.map((d) => ({
              id_producto: d.id_producto,
              cantidad: d.cantidad,
              precio_unitario: d.precio_unitario,
              subtotal: d.subtotal,
            })),
          },
        },
        include: {
          detalle: { include: { producto: { select: { id_producto: true, nombre: true, referencia: true } } } },
          cliente: { select: { id_cliente: true, nombre: true } },
          usuario: { select: { id_usuario: true, nombre: true } },
        },
      });

      for (const d of detalleData) {
        await tx.producto.update({
          where: { id_producto: d.id_producto },
          data: { stock: { decrement: d.cantidad } },
        });
        await tx.movimiento.create({
          data: {
            id_producto: d.id_producto,
            tipo_movimiento: 'SALIDA',
            cantidad: d.cantidad,
            motivo: `Venta #${v.id_venta}`,
            id_usuario: userId,
            id_cliente: dto.id_cliente ?? null,
          },
        });
      }

      return v;
    });

    this.audit.log({
      userId, userName, ip,
      action: 'Registró venta',
      entity: 'Venta', entityId: venta.id_venta,
      detail: `Venta #${venta.id_venta} — $${Number(total).toLocaleString('es-CO')} — ${detalleData.length} producto(s)`,
    });

    return { success: true, data: venta };
  }

  /**
   * Obtiene todas las ventas con paginación.
   * @param pagination - Parámetros de paginación
   * @returns Resultado paginado con lista de ventas
   */
  async findAll(pagination: PaginationDto) {
    const result = await paginate(this.prisma.venta, pagination, {
      include: {
        detalle: { include: { producto: { select: { id_producto: true, nombre: true, referencia: true } } } },
        cliente: { select: { id_cliente: true, nombre: true } },
        usuario: { select: { id_usuario: true, nombre: true } },
      },
      orderBy: { created_at: 'desc' },
    });
    return { success: true, ...result };
  }

  /**
   * Obtiene una venta por su ID.
   * @param id - ID de la venta
   * @returns Venta encontrada con detalles, cliente y usuario
   */
  async findOne(id: number) {
    const venta = await this.prisma.venta.findUnique({
      where: { id_venta: id },
      include: {
        detalle: { include: { producto: true } },
        cliente: true,
        usuario: { select: { id_usuario: true, nombre: true } },
      },
    });
    if (!venta) throw new NotFoundException(`Venta ${id} no encontrada`);
    return { success: true, data: venta };
  }

  /**
   * Genera un archivo PDF con la factura de una venta.
   * @param id - ID de la venta
   * @returns Buffer con el contenido del PDF
   */
  async generatePdf(id: number): Promise<Buffer> {
    const venta = await this.prisma.venta.findUnique({
      where: { id_venta: id },
      include: {
        detalle: { include: { producto: true } },
        cliente: true,
        usuario: { select: { id_usuario: true, nombre: true } },
      },
    });
    if (!venta) throw new NotFoundException(`Venta ${id} no encontrada`);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(20).text('JYJGestor', { align: 'center' });
      doc.fontSize(12).text('Sistema de Inventario', { align: 'center' });
      doc.moveDown(1.5);

      doc.fontSize(10);
      doc.text(`Factura #${venta.id_venta}`);
      doc.text(`Cliente: ${venta.cliente?.nombre || 'Mostrador'}`);
      doc.text(`Vendedor: ${venta.usuario?.nombre}`);
      doc.text(`Fecha: ${venta.created_at.toLocaleDateString('es-CO')}`);
      doc.text(`Estado: ${venta.estado}`);
      doc.moveDown(1);

      const tableTop = doc.y;
      const colX = [40, 200, 320, 420, 480];
      const headers = ['Producto', 'Cant.', 'Precio', 'Subtotal'];
      doc.fontSize(10).font('Helvetica-Bold');
      headers.forEach((h, i) => doc.text(h, colX[i], tableTop, { width: colX[i + 1] - colX[i] || 60 }));
      doc.moveDown(0.5);

      doc.font('Helvetica').fontSize(9);
      venta.detalle.forEach((d) => {
        const y = doc.y;
        doc.text(d.producto?.nombre || `#${d.id_producto}`, colX[0], y, { width: colX[1] - colX[0] });
        doc.text(String(d.cantidad), colX[1], y, { width: colX[2] - colX[1], align: 'center' });
        doc.text(`$${Number(d.precio_unitario).toLocaleString('es-CO')}`, colX[2], y, { width: colX[3] - colX[2], align: 'right' });
        doc.text(`$${Number(d.subtotal).toLocaleString('es-CO')}`, colX[3], y, { width: colX[4] - colX[3], align: 'right' });
        doc.moveDown(0.3);
      });

      doc.moveDown(1);
      doc.fontSize(14).font('Helvetica-Bold');
      doc.text(`Total: $${Number(venta.total).toLocaleString('es-CO')}`, { align: 'right' });

      doc.end();
    });
  }

  /**
   * Anula una venta y restituye el stock de los productos.
   * Registra un movimiento de entrada por cada producto y un registro de auditoría.
   * @param id - ID de la venta a anular
   * @param userId - ID del usuario que anula
   * @param userName - Nombre del usuario para auditoría
   * @param ip - Dirección IP para auditoría
   * @returns Mensaje de confirmación
   */
  async anular(id: number, userId: number, userName?: string, ip?: string) {
    const venta = await this.prisma.venta.findUnique({
      where: { id_venta: id },
      include: { detalle: true },
    });
    if (!venta) throw new NotFoundException(`Venta ${id} no encontrada`);
    if (venta.estado === 'ANULADA') throw new BadRequestException(`La venta ${id} ya está anulada`);

    await this.prisma.$transaction(async (tx) => {
      await tx.venta.update({
        where: { id_venta: id },
        data: { estado: 'ANULADA' },
      });

      for (const d of venta.detalle) {
        await tx.producto.update({
          where: { id_producto: d.id_producto },
          data: { stock: { increment: d.cantidad } },
        });
        await tx.movimiento.create({
          data: {
            id_producto: d.id_producto,
            tipo_movimiento: 'ENTRADA',
            cantidad: d.cantidad,
            motivo: `Anulación venta #${id}`,
            id_usuario: userId,
            id_cliente: venta.id_cliente,
          },
        });
      }
    });

    this.audit.log({
      userId, userName, ip,
      action: 'Anuló venta',
      entity: 'Venta', entityId: id,
      detail: `Venta #${id} anulada — $${Number(venta.total).toLocaleString('es-CO')}`,
    });

    return { success: true, message: `Venta #${id} anulada, stock restituido` };
  }
}
