import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, Res,
  ParseIntPipe, UseGuards, UseInterceptors, UploadedFile, Req,
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

  @Post()
  @UseGuards(RolesGuard)
  @Roles(1)
  create(@Body() dto: CreateProductoDto, @Req() req: any) {
    return this.productosService.create(dto, req.user.id, req.user.nombre, req.ip);
  }

  @Get()
  findAll(@Query() pagination: PaginationDto, @Query('search') search?: string) {
    return this.productosService.findAll(pagination, search);
  }

  @Get('bajo-stock')
  findLowStock() {
    return this.productosService.findLowStock();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(1)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductoDto, @Req() req: any) {
    return this.productosService.update(id, dto, req.user.id, req.user.nombre, req.ip);
  }

  @Post(':id/imagen')
  @UseGuards(RolesGuard)
  @Roles(1)
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (_req, file, cb) => {
          const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
          cb(null, name);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadImage(@Param('id', ParseIntPipe) id: number, @UploadedFile() file: Express.Multer.File) {
    return this.productosService.updateImage(id, file.filename);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(1)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.productosService.remove(id, req.user.id, req.user.nombre, req.ip);
  }
}
