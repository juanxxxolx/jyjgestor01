/**
 * @fileoverview Punto de entrada principal de la aplicación NestJS.
 * Configura middleware global (helmet, CORS, validación de pipes),
 * establece el prefijo global de rutas ('api') y expone archivos
 * estáticos desde la carpeta 'uploads'. Inicia el servidor HTTP
 * en el puerto especificado en la variable de entorno PORT o 3000.
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { SanitizeStringsPipe } from './common/pipes/sanitizar-strings.pipe';

/**
 * Inicializa y arranca la aplicación NestJS con toda la configuración global.
 *
 * Configura:
 * - Helmet para seguridad HTTP (CSP deshabilitado, política cross-origin).
 * - Prefijo global 'api' para todas las rutas.
 * - Archivos estáticos desde la carpeta 'uploads'.
 * - ValidationPipe global con whitelist, forbidNonWhitelisted y transform.
 * - CORS para orígenes locales de desarrollo.
 *
 * @throws Error si no se puede iniciar el servidor en el puerto configurado.
 */
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  app.setGlobalPrefix('api');
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  app.useGlobalPipes(new SanitizeStringsPipe());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Backend corriendo en http://localhost:${port}/api`);
}
bootstrap();
