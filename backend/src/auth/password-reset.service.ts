/**
 * @fileoverview Servicio de tokens de recuperación de contraseña.
 * Centraliza la creación, validación y consumo de tokens para que tanto
 * el flujo público (olvidé mi contraseña) como el flujo del administrador
 * (generar enlace desde Usuarios) usen exactamente la misma lógica.
 */
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

/** Minutos de vigencia del enlace de recuperación. */
export const PASSWORD_RESET_TTL_MINUTES = 60;

/** Propósito que debe tener el JWT para ser aceptado como token de recuperación. */
const PASSWORD_RESET_PURPOSE = 'password_reset';

/** Resultado de generar un token de recuperación. */
export interface PasswordResetCreation {
  link: string;
  expires_at: Date;
  emailSent: boolean;
}

/** Usuario mínimo requerido para generar un token. */
interface ResetUser {
  id_usuario: number;
  email: string;
  nombre: string;
}

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {}

  /** URL base del frontend para construir el enlace del correo. */
  private get frontendUrl(): string {
    const url = this.config.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    return url.replace(/\/+$/, '');
  }

  /** Construye el enlace que el usuario debe abrir. */
  buildLink(token: string): string {
    return `${this.frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
  }

  /**
   * Genera un nuevo token para el usuario.
   * - Elimina tokens viejos (usados o expirados) de ese correo.
   * - Invalida cualquier token pendiente anterior (solo el último sirve).
   * - Intenta enviarlo por correo si el SMTP está configurado.
   */
  async createForUser(usuario: ResetUser, options: { sendEmail: boolean }): Promise<PasswordResetCreation> {
    // Limpieza: tokens usados o expirados de este correo
    await this.prisma.passwordResetToken.deleteMany({
      where: {
        email: usuario.email,
        OR: [{ used: true }, { expires_at: { lt: new Date() } }],
      },
    });

    // Solo puede existir un enlace válido a la vez
    await this.prisma.passwordResetToken.updateMany({
      where: { email: usuario.email, used: false },
      data: { used: true },
    });

    const token = this.jwt.sign(
      { id: usuario.id_usuario, email: usuario.email, purpose: PASSWORD_RESET_PURPOSE },
      { expiresIn: `${PASSWORD_RESET_TTL_MINUTES}m` },
    );

    const expires_at = new Date(Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: { email: usuario.email, token, expires_at },
    });

    const link = this.buildLink(token);
    let emailSent = false;

    if (options.sendEmail && this.mail.isConfigured) {
      emailSent = await this.mail.sendPasswordReset({
        to: usuario.email,
        nombre: usuario.nombre,
        link,
        expiresMinutes: PASSWORD_RESET_TTL_MINUTES,
      });
    }

    // Registro en consola: útil en desarrollo o cuando el SMTP no está configurado
    if (!emailSent) {
      this.logger.log(`Enlace de recuperación para ${usuario.email}: ${link}`);
    }

    return { link, expires_at, emailSent };
  }

  /**
   * Verifica que el token sea un JWT válido, exista en la base de datos,
   * no haya sido usado y no esté expirado.
   * @throws BadRequestException si el token no es válido.
   */
  async findValid(token: string) {
    let payload: any;
    try {
      payload = this.jwt.verify(token);
    } catch {
      throw new BadRequestException('El enlace es inválido o expiró. Solicita uno nuevo.');
    }

    if (payload?.purpose !== PASSWORD_RESET_PURPOSE) {
      throw new BadRequestException('El enlace es inválido o expiró. Solicita uno nuevo.');
    }

    const record = await this.prisma.passwordResetToken.findUnique({ where: { token } });

    if (!record || record.used || record.expires_at < new Date()) {
      throw new BadRequestException('El enlace es inválido o expiró. Solicita uno nuevo.');
    }

    return record;
  }
}
