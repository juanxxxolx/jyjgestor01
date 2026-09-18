/**
 * @fileoverview Servicio de conexión a la base de datos MySQL mediante Prisma ORM.
 * Extiende PrismaClient e implementa los hooks de ciclo de vida de NestJS
 * para conectar al iniciar el módulo y desconectar al destruirlo.
 * Incluye lógica de reintentos automáticos ante fallos de conexión.
 */
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private retryDelay = 2000;
  private maxRetries = 10;

  constructor() {
    super({
      log: ['warn', 'error'],
      errorFormat: 'minimal',
    });
  }

  /**
   * Hook ejecutado al inicializar el módulo. Intenta conectar con la
   * base de datos usando reintentos automáticos.
   */
  async onModuleInit() {
    await this.connectWithRetry();
  }

  /**
   * Intenta conectar a MySQL con reintentos en caso de error.
   *
   * @param attempt - Número de intento actual (por defecto 1)
   * @throws Error si se agotan todos los reintentos sin poder conectar
   */
  private async connectWithRetry(attempt = 1) {
    try {
      await this.$connect();
      this.logger.log('Prisma conectado a MySQL');
    } catch (err) {
      this.logger.error(`Error conectando a MySQL (intento ${attempt}/${this.maxRetries}): ${err.message}`);
      if (attempt < this.maxRetries) {
        this.logger.log(`Reintentando en ${this.retryDelay / 1000}s...`);
        await new Promise((r) => setTimeout(r, this.retryDelay));
        return this.connectWithRetry(attempt + 1);
      }
      this.logger.error('No se pudo conectar a MySQL después de varios intentos');
      throw err;
    }
  }

  /**
   * Hook ejecutado al destruir el módulo. Desconecta Prisma de MySQL.
   */
  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma desconectado de MySQL');
  }
}
