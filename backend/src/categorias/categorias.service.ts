import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCategoriaDto) {
    const existe = await this.prisma.categoria.findFirst({
      where: { nombre_categoria: dto.nombre_categoria },
    });
    if (existe) throw new ConflictException(`Categoría '${dto.nombre_categoria}' ya existe`);

    const categoria = await this.prisma.categoria.create({ data: dto });
    return { success: true, data: categoria };
  }

  async findAll() {
    const categorias = await this.prisma.categoria.findMany({
      orderBy: { nombre_categoria: 'asc' },
    });
    return { success: true, data: categorias };
  }

  async findOne(id: number) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id_categoria: id },
    });
    if (!categoria) throw new NotFoundException(`Categoría ${id} no encontrada`);
    return { success: true, data: categoria };
  }

  async update(id: number, dto: UpdateCategoriaDto) {
    await this.findOne(id);

    if (dto.nombre_categoria) {
      const duplicado = await this.prisma.categoria.findFirst({
        where: { nombre_categoria: dto.nombre_categoria, NOT: { id_categoria: id } },
      });
      if (duplicado) throw new ConflictException(`Categoría '${dto.nombre_categoria}' ya existe`);
    }

    const categoria = await this.prisma.categoria.update({
      where: { id_categoria: id },
      data: dto,
    });
    return { success: true, data: categoria };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.categoria.delete({ where: { id_categoria: id } });
    return { success: true, message: 'Categoría eliminada' };
  }
}
