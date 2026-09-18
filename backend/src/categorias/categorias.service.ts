/**
 * @fileoverview Servicio de Categorías.
 * Implementa la lógica de negocio para la gestión de categorías:
 * crear, listar, obtener por ID, actualizar y eliminar.
 * Verifica duplicados por nombre de categoría.
 */
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea una nueva categoría.
   * Verifica que no exista una categoría con el mismo nombre.
   *
   * @param dto - Datos de la categoría
   * @returns Categoría creada
   * @throws ConflictException si la categoría ya existe
   */
  async create(dto: CreateCategoriaDto) {
    const existe = await this.prisma.categoria.findFirst({
      where: { nombre_categoria: dto.nombre_categoria },
    });
    if (existe) throw new ConflictException(`Categoría '${dto.nombre_categoria}' ya existe`);

    const categoria = await this.prisma.categoria.create({ data: dto });
    return { success: true, data: categoria };
  }

  /**
   * Obtiene todas las categorías ordenadas alfabéticamente.
   *
   * @returns Lista de categorías
   */
  async findAll() {
    const categorias = await this.prisma.categoria.findMany({
      orderBy: { nombre_categoria: 'asc' },
    });
    return { success: true, data: categorias };
  }

  /**
   * Obtiene una categoría por su ID.
   *
   * @param id - ID de la categoría
   * @returns Categoría encontrada
   * @throws NotFoundException si no existe
   */
  async findOne(id: number) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id_categoria: id },
    });
    if (!categoria) throw new NotFoundException(`Categoría ${id} no encontrada`);
    return { success: true, data: categoria };
  }

  /**
   * Actualiza una categoría.
   * Verifica que el nuevo nombre no esté duplicado.
   *
   * @param id - ID de la categoría
   * @param dto - Datos a actualizar
   * @returns Categoría actualizada
   * @throws NotFoundException si no existe
   * @throws ConflictException si el nombre ya está en uso
   */
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

  /**
   * Elimina una categoría.
   *
   * @param id - ID de la categoría
   * @returns Mensaje de confirmación
   * @throws NotFoundException si no existe
   */
  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.categoria.delete({ where: { id_categoria: id } });
    return { success: true, message: 'Categoría eliminada' };
  }
}
