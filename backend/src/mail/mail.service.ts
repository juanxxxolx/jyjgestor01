/**
 * @fileoverview Servicio de envío de correo electrónico.
 * Usa nodemailer con configuración SMTP tomada de variables de entorno.
 * Si el SMTP no está configurado, el servicio queda inactivo y el sistema
 * sigue funcionando (el enlace de recuperación se muestra al administrador).
 */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

/** Datos necesarios para enviar el correo de recuperación de contraseña. */
export interface PasswordResetMailParams {
  to: string;
  nombre: string;
  link: string;
  expiresMinutes: number;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null = null;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = Number(this.config.get<string>('SMTP_PORT') || 587);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    const secure = String(this.config.get<string>('SMTP_SECURE') || 'false') === 'true';

    this.from = this.config.get<string>('SMTP_FROM') || user || 'no-reply@jyjgestor.com';

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: secure || port === 465,
        auth: { user, pass },
      });
      this.logger.log(`SMTP configurado (${host}:${port})`);
    } else {
      this.logger.warn(
        'SMTP no configurado. Los enlaces de recuperación no se enviarán por correo; ' +
        'el administrador podrá generarlos desde Usuarios y el servidor los mostrará en consola.',
      );
    }
  }

  /** Indica si el servidor SMTP está configurado. */
  get isConfigured(): boolean {
    return this.transporter !== null;
  }

  /**
   * Envía el correo con el enlace de recuperación de contraseña.
   * @returns `true` si el correo se envió correctamente, `false` en caso contrario.
   */
  async sendPasswordReset(params: PasswordResetMailParams): Promise<boolean> {
    if (!this.transporter) return false;

    const { to, nombre, link, expiresMinutes } = params;

    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject: 'Recupera tu contraseña — JYJGestor',
        text:
          `Hola ${nombre},\n\n` +
          `Recibimos una solicitud para restablecer la contraseña de tu cuenta en JYJGestor.\n\n` +
          `Abre este enlace para crear una nueva contraseña:\n${link}\n\n` +
          `El enlace vence en ${expiresMinutes} minutos y solo puede usarse una vez.\n` +
          `Si no solicitaste este cambio, ignora este mensaje: tu contraseña actual seguirá funcionando.\n\n` +
          `— Equipo JYJGestor`,
        html: `
          <div style="font-family: Arial, Helvetica, sans-serif; background:#0a0e1a; padding:32px;">
            <div style="max-width:520px; margin:0 auto; background:#14192d; border:1px solid rgba(79,195,247,0.25); border-radius:12px; padding:32px; color:#e8eaf6;">
              <h2 style="margin:0 0 8px; color:#4fc3f7;">Recupera tu contraseña</h2>
              <p style="margin:0 0 16px; color:#c7d2fe;">Hola ${nombre},</p>
              <p style="margin:0 0 24px; line-height:1.6;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en
                <strong>JYJGestor</strong>. Haz clic en el botón para crear una nueva contraseña.
              </p>
              <p style="text-align:center; margin:0 0 24px;">
                <a href="${link}" style="display:inline-block; background:#1890ff; color:#ffffff; text-decoration:none; padding:12px 28px; border-radius:8px; font-weight:600;">
                  Crear nueva contraseña
                </a>
              </p>
              <p style="margin:0 0 8px; font-size:13px; color:#90caf9;">
                El enlace vence en ${expiresMinutes} minutos y solo puede usarse una vez.
              </p>
              <p style="margin:0; font-size:13px; color:#90caf9;">
                Si no solicitaste este cambio, ignora este mensaje: tu contraseña actual seguirá funcionando.
              </p>
              <hr style="border:none; border-top:1px solid rgba(255,255,255,0.1); margin:24px 0;" />
              <p style="margin:0; font-size:12px; color:#64748b;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br />
                <span style="word-break:break-all; color:#90caf9;">${link}</span>
              </p>
            </div>
          </div>
        `,
      });
      this.logger.log(`Correo de recuperación enviado a ${to}`);
      return true;
    } catch (error: any) {
      this.logger.error(`No se pudo enviar el correo a ${to}: ${error?.message ?? error}`);
      return false;
    }
  }
}
