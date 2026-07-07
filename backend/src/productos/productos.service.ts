import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { paginate } from '../common/utils/pagination';

@Injectable()
export class ProductosService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async create(dto: CreateProductoDto, userId?: number, userName?: string, ip?: string) {
    const existe = await this.prisma.producto.findUnique({ where: { referencia: dto.referencia } });
    if (existe) throw new ConflictException(`Referencia '${dto.referencia}' ya existe`);

    const producto = await this.prisma.producto.create({
      data: { ...dto, precio_venta: dto.precio_venta },
      include: { categoria: true },
    });

    this.audit.log({
      userId, userName, ip,
      action: 'Creó producto',
      entity: 'Producto', entityId: producto.id_producto,
      detail: `${producto.nombre} (ref: ${producto.referencia})`,
    });

    return { success: true, data: producto };
  }

  async findAll(pagination: PaginationDto, search?: string) {
    const where = search
      ? {
          OR: [
            { nombre: { contains: search } },
            { referencia: { contains: search } },
          ],
        }
      : {};
    const result = await paginate(this.prisma.producto, pagination, {
      where,
      include: { categoria: true },
      orderBy: { nombre: 'asc' },
    });
    return { success: true, ...result };
  }

  async findOne(id: number) {
    const producto = await this.prisma.producto.findUnique({
      where: { id_producto: id },
      include: { categoria: true },
    });
    if (!producto) throw new NotFoundException(`Producto ${id} no encontrado`);
    return { success: true, data: producto };
  }

  async findLowStock() {
    const bajoStock = await this.prisma.$queryRaw<any[]>`
      SELECT p.*, c.nombre_categoria FROM productos p
      LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
      WHERE p.stock <= p.stock_minimo
    `;
    return { success: true, data: bajoStock };
  }

  async update(id: number, dto: UpdateProductoDto, userId?: number, userName?: string, ip?: string) {
    const actual = await this.findOne(id);
    const productoActual = actual.data;

    if (dto.referencia) {
      const duplicado = await this.prisma.producto.findFirst({
        where: { referencia: dto.referencia, NOT: { id_producto: id } },
      });
      if (duplicado) throw new ConflictException(`Referencia '${dto.referencia}' ya existe`);
    }

    const precioCambiado = dto.precio_venta !== undefined &&
      Number(dto.precio_venta) !== Number(productoActual.precio_venta);

    const [producto] = await this.prisma.$transaction([
      this.prisma.producto.update({
        where: { id_producto: id },
        data: dto,
        include: { categoria: true },
      }),
      ...(precioCambiado
        ? [
            this.prisma.precioHistorico.create({
              data: {
                id_producto: id,
                precio_anterior: productoActual.precio_venta,
                precio_nuevo: dto.precio_venta,
                id_usuario: userId,
              },
            }),
          ]
        : []),
    ]);

    const cambios: string[] = [];
    if (dto.nombre && dto.nombre !== productoActual.nombre) cambios.push(`nombre: "${productoActual.nombre}" → "${dto.nombre}"`);
    if (dto.precio_venta !== undefined && Number(dto.precio_venta) !== Number(productoActual.precio_venta)) cambios.push(`precio: $${productoActual.precio_venta} → $${dto.precio_venta}`);
    if (dto.stock !== undefined && dto.stock !== productoActual.stock) cambios.push(`stock: ${productoActual.stock} → ${dto.stock}`);

    this.audit.log({
      userId, userName, ip,
      action: 'Editó producto',
      entity: 'Producto', entityId: id,
      detail: cambios.length ? `${productoActual.nombre} — ${cambios.join(', ')}` : productoActual.nombre,
    });

    return { success: true, data: producto };
  }

  async updateImage(id: number, filename: string) {
    const producto = await this.prisma.producto.update({
      where: { id_producto: id },
      data: { imagen_url: `/uploads/${filename}` },
      include: { categoria: true },
    });
    return { success: true, data: producto };
  }

  async remove(id: number, userId?: number, userName?: string, ip?: string) {
    const producto = await this.findOne(id);
    await this.prisma.producto.delete({ where: { id_producto: id } });

    this.audit.log({
      userId, userName, ip,
      action: 'Eliminó producto',
      entity: 'Producto', entityId: id,
      detail: `${producto.data.nombre} (ref: ${producto.data.referencia})`,
    });

    return { success: true, message: 'Producto eliminado' };
  }
}
