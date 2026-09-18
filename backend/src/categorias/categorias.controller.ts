/**
 * @fileoverview Controlador del módulo de Categorías.
 * Gestiona las operaciones CRUD de categorías de productos.
 * La creación, actualización y eliminación requieren rol de administrador.
 * La consulta requiere autenticación JWT.
 */
import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { ExportService } from '../common/services/export.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('categorias')
export class CategoriasController {
  constructor(
    private categoriasService: CategoriasService,
    private exportService: ExportService,
  ) {}

  /**
   * Exporta la lista de categorías a un archivo Excel.
   *
   * @param res - Objeto de respuesta HTTP para enviar el archivo
   */
  @Get('export')
  async export(@Res() res: Response) {
    const { data } = await this.categoriasService.findAll();
    const buffer = await this.exportService.generateExcel(
      'Categorías',
      [
        { header: 'ID', key: 'id', width: 8 },
        { header: 'Nombre', key: 'nombre', width: 30 },
      ],
      data.map((c: any) => ({
        id: c.id_categoria,
        nombre: c.nombre_categoria,
      })),
    );
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=categorias-${Date.now()}.xlsx`);
    res.send(buffer);
  }

  /**
   * Crea una nueva categoría (solo administradores).
   *
   * @param dto - Datos de la categoría a crear
   * @returns Categoría creada
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(1)
  create(@Body() dto: CreateCategoriaDto) {
    return this.categoriasService.create(dto);
  }

  /**
   * Obtiene todas las categorías.
   *
   * @returns Lista de categorías ordenadas alfabéticamente
   */
  @Get()
  findAll() {
    return this.categoriasService.findAll();
  }

  /**
   * Obtiene una categoría por su ID.
   *
   * @param id - ID de la categoría
   * @returns Categoría encontrada
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.findOne(id);
  }

  /**
   * Actualiza una categoría (solo administradores).
   *
   * @param id - ID de la categoría
   * @param dto - Datos a actualizar
   * @returns Categoría actualizada
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(1)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoriaDto) {
    return this.categoriasService.update(id, dto);
  }

  /**
   * Elimina una categoría (solo administradores).
   *
   * @param id - ID de la categoría
   * @returns Mensaje de confirmación
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(1)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.remove(id);
  }
}
