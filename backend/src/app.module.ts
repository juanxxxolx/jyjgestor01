/**
 * @fileoverview Módulo raíz de la aplicación NestJS.
 * Importa y centraliza todos los módulos de funcionalidad del sistema
 * (autenticación, clientes, productos, ventas, compras, etc.).
 * Configura guards globales como ThrottlerGuard para limitación de
 * peticiones y carga global de variables de entorno via ConfigModule.
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
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
import { CotizacionesModule } from './cotizaciones/cotizaciones.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { ComprasModule } from './compras/compras.module';
import { AbonosModule } from './abonos/abonos.module';
import { CierresCajaModule } from './cierres-caja/cierres-caja.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 300 }]),
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
    CotizacionesModule,
    ProveedoresModule,
    ComprasModule,
    AbonosModule,
    CierresCajaModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
