import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ClientesModule } from './clientes/clientes.module';
import { ProductosModule } from './productos/productos.module';
import { MovimientosModule } from './movimientos/movimientos.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { CategoriasModule } from './categorias/categorias.module';
import { PreciosHistoricosModule } from './precios-historicos/precios-historicos.module';
import { VentasModule } from './ventas/ventas.module';
import { ExportModule } from './common/services/export.module';
import { AuditModule } from './audit/audit.module';
import { ReportesModule } from './reportes/reportes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ClientesModule,
    ProductosModule,
    MovimientosModule,
    UsuariosModule,
    CategoriasModule,
    PreciosHistoricosModule,
    ExportModule,
    AuditModule,
    VentasModule,
    ReportesModule,
  ],
})
export class AppModule {}
