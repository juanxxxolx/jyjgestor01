/**
 * @fileoverview Controlador del módulo de Productos.
 * Gestiona las operaciones CRUD de productos, exportación a Excel,
 * carga de imágenes y consulta de productos con bajo stock.
 * La creación, actualización, eliminación y carga de imágenes
 * requieren rol de administrador.
 */
import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, Res,
  ParseIntPipe, UseGuards, UseInterceptors, UploadedFile, Req, BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ProductosService } from './productos.service';
import { ExportService } from '../common/services/export.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('productos')
export class ProductosController {
  constructor(
    private productosService: ProductosService,
    private exportService: ExportService,
  ) {}

  /**
   * Exporta la lista de productos a un archivo Excel.
   *
   * @param res - Objeto de respuesta HTTP para enviar el archivo
   */
  @Get('export')
  async export(@Res() res: Response) {
    const { data } = await this.productosService.findAll({ page: 1, limit: 10000 });
    const buffer = await this.exportService.generateExcel(
      'Productos',
      [
        { header: 'Nombre', key: 'nombre', width: 30 },
        { header: 'Referencia', key: 'referencia', width: 20 },
        { header: 'Categoría', key: 'categoria', width: 20 },
        { header: 'Precio', key: 'precio_venta', width: 15 },
        { header: 'Stock', key: 'stock', width: 10 },
        { header: 'Stock Mínimo', key: 'stock_minimo', width: 15 },
      ],
      data.map((p: any) => ({
        nombre: p.nombre,
        referencia: p.referencia,
        categoria: p.categoria?.nombre_categoria ?? '',
        precio_venta: Number(p.precio_venta),
        stock: p.stock,
        stock_minimo: p.stock_minimo,
      })),
    );
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=productos-${Date.now()}.xlsx`);
    res.send(buffer);
  }

  /**
   * Crea un nuevo producto (solo administradores).
   *
   * @param dto - Datos del producto
   * @param req - Objeto de solicitud HTTP
   * @returns Producto creado
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(1)
  create(@Body() dto: CreateProductoDto, @Req() req: any) {
    return this.productosService.create(dto, req.user.id, req.user.nombre, req.ip);
  }

  /**
   * Obtiene todos los productos con paginación y búsqueda opcional.
   *
   * @param pagination - Parámetros de paginación
   * @param search - Término de búsqueda (nombre o referencia)
   * @returns Lista paginada de productos
   */
  @Get()
  findAll(@Query() pagination: PaginationDto, @Query('search') search?: string) {
    return this.productosService.findAll(pagination, search);
  }

  /**
   * Obtiene productos con stock igual o inferior al stock mínimo.
   *
   * @returns Lista de productos con bajo stock
   */
  @Get('bajo-stock')
  findLowStock() {
    return this.productosService.findLowStock();
  }

  /**
   * Obtiene un producto por su ID.
   *
   * @param id - ID del producto
   * @returns Producto encontrado
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.findOne(id);
  }

  /**
   * Actualiza un producto (solo administradores).
   * Si cambia el precio, registra un precio histórico.
   *
   * @param id - ID del producto
   * @param dto - Datos a actualizar
   * @param req - Objeto de solicitud HTTP
   * @returns Producto actualizado
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(1)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductoDto, @Req() req: any) {
    return this.productosService.update(id, dto, req.user.id, req.user.nombre, req.ip);
  }

  /**
   * Carga una imagen para un producto (solo administradores).
   * Acepta archivos JPEG, PNG, WebP y GIF de hasta 5 MB.
   *
   * @param id - ID del producto
   * @param file - Archivo de imagen subido
   * @returns Producto actualizado con la URL de la imagen
   */
  @Post(':id/imagen')
  @UseGuards(RolesGuard)
  @Roles(1)
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase();
          const allowedExt = ['.jpg', '.jpeg', '.png', '.webp'];
          if (!allowedExt.includes(ext)) {
            cb(new BadRequestException('Solo se permiten imágenes JPG, PNG o WEBP'), null);
            return;
          }
          const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
          cb(null, name);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedMimes.includes(file.mimetype)) {
          cb(new BadRequestException('Solo se permiten imágenes JPG, PNG o WEBP'), null);
          return;
        }
        cb(null, true);
      },
    }),
  )
  uploadImage(@Param('id', ParseIntPipe) id: number, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Se requiere una imagen');
    }
    return this.productosService.updateImage(id, file.filename);
  }

  /**
   * Elimina un producto (solo administradores).
   *
   * @param id - ID del producto
   * @param req - Objeto de solicitud HTTP
   * @returns Mensaje de confirmación
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(1)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.productosService.remove(id, req.user.id, req.user.nombre, req.ip);
  }
}
