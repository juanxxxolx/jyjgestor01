import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductoDto) {
    const existe = await this.prisma.producto.findUnique({ where: { referencia: dto.referencia } });
    if (existe) throw new ConflictException(`Referencia '${dto.referencia}' ya existe`);

    const producto = await this.prisma.producto.create({
      data: { ...dto, precio_venta: dto.precio_venta },
      include: { categoria: true },
    });
    return { success: true, data: producto };
  }

  async findAll() {
    const productos = await this.prisma.producto.findMany({
      include: { categoria: true },
      orderBy: { nombre: 'asc' },
    });
    return { success: true, data: productos };
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

  async update(id: number, dto: UpdateProductoDto) {
    await this.findOne(id);

    if (dto.referencia) {
      const duplicado = await this.prisma.producto.findFirst({
        where: { referencia: dto.referencia, NOT: { id_producto: id } },
      });
      if (duplicado) throw new ConflictException(`Referencia '${dto.referencia}' ya existe`);
    }

    const producto = await this.prisma.producto.update({
      where: { id_producto: id },
      data: dto,
      include: { categoria: true },
    });
    return { success: true, data: producto };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.producto.delete({ where: { id_producto: id } });
    return { success: true, message: 'Producto eliminado' };
  }
}
