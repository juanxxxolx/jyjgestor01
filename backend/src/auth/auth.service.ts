/**
 * @fileoverview Servicio de autenticación y gestión de usuarios.
 * Proporciona funcionalidades de registro, inicio de sesión,
 * recuperación de contraseña (forgot/reset), cambio de contraseña
 * y generación de tokens JWT. Utiliza bcrypt para el hash de
 * contraseñas y JWT para la creación de tokens de acceso.
 */
import { Injectable, ConflictException, UnauthorizedException, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { PasswordResetService } from './password-reset.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private audit: AuditService,
    private passwordReset: PasswordResetService,
  ) {}

  /**
   * Registra un nuevo usuario en el sistema.
   * El usuario se crea con estado 'activo: false' hasta que un
   * administrador apruebe la cuenta. Se registra un log de auditoría.
   *
   * @param dto - Datos del registro (nombre, email, contraseña, rol opcional)
   * @returns Objeto con mensaje de éxito indicando que se espera aprobación
   * @throws ConflictException si el email ya está registrado
   */
  async register(dto: RegisterDto) {
    const existe = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    if (existe) throw new ConflictException('El email ya está registrado');

    const password_hash = await bcrypt.hash(dto.password, 12);
    const usuario = await this.prisma.usuario.create({
      data: {
        nombre: dto.nombre,
        email: dto.email.toLowerCase().trim(),
        password_hash,
        id_rol: dto.id_rol ?? 2,
        activo: false,
      },
    });

    this.audit.log({
      userId: usuario.id_usuario, userName: usuario.nombre,
      action: 'Se registró (pendiente de aprobación)',
      entity: 'Usuario', entityId: usuario.id_usuario,
    });

    return {
      success: true,
      message: 'Registro exitoso. Espera a que un administrador active tu cuenta.',
    };
  }

  /**
   * Inicia sesión con email y contraseña.
   * Verifica que el usuario exista, esté activo y la contraseña sea correcta.
   * Retorna un token JWT y los datos básicos del usuario.
   *
   * @param dto - Credenciales de inicio de sesión (email, password)
   * @returns Objeto con token JWT y datos del usuario autenticado
   * @throws UnauthorizedException si las credenciales son inválidas o la cuenta está inactiva
   */
  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!usuario) throw new UnauthorizedException('Credenciales inválidas');

    if (!usuario.activo) throw new UnauthorizedException('Tu cuenta está pendiente de aprobación por un administrador');

    const match = await bcrypt.compare(dto.password, usuario.password_hash);
    if (!match) throw new UnauthorizedException('Credenciales inválidas');

    const token = this.signToken(usuario.id_usuario, usuario.email, usuario.nombre, usuario.id_rol);
    return {
      success: true,
      token,
      user: { id: usuario.id_usuario, nombre: usuario.nombre, email: usuario.email, rol: usuario.id_rol },
    };
  }

  /**
   * Solicita un token de recuperación de contraseña.
   * Por seguridad, la respuesta es siempre la misma (exista o no el email)
   * y NUNCA se devuelve el token al cliente: se envía por correo o el
   * administrador lo genera desde el módulo de Usuarios.
   *
   * @param dto - Objeto con el email del usuario
   * @returns Mensaje genérico indicando que si el email existe se enviará un enlace
   */
  async forgotPassword(dto: { email: string }) {
    const email = dto.email.toLowerCase().trim();
    const respuesta = {
      success: true,
      message: 'Si el email está registrado, recibirás un enlace de recuperación. Revisa también la carpeta de spam.',
    };

    const usuario = await this.prisma.usuario.findFirst({
      where: { email, activo: true },
    });

    // Respuesta idéntica aunque el usuario no exista (evita enumerar cuentas)
    if (!usuario) return respuesta;

    const { emailSent } = await this.passwordReset.createForUser(usuario, { sendEmail: true });

    await this.logAudit({
      userId: usuario.id_usuario,
      userName: usuario.nombre,
      action: 'Solicitó recuperación de contraseña',
      entity: 'Usuario',
      entityId: usuario.id_usuario,
      detail: emailSent ? 'Enlace enviado por correo' : 'Enlace generado (SMTP no configurado)',
    });

    return respuesta;
  }

  /**
   * Verifica si un token de recuperación es válido, sin consumirlo.
   * Permite que el frontend muestre un mensaje claro antes de pedir la contraseña.
   */
  async validateResetToken(token: string) {
    const record = await this.passwordReset.findValid(token);
    return { success: true, valid: true, expires_at: record.expires_at };
  }

  /**
   * Restablece la contraseña usando un token de recuperación válido.
   * Verifica que el token exista, no haya sido usado y no esté expirado.
   * Actualiza la contraseña, invalida todos los tokens del usuario y
   * registra la acción en auditoría.
   *
   * @param dto - Objeto con el token y la nueva contraseña
   * @returns Mensaje de confirmación de actualización
   * @throws BadRequestException si el token es inválido, usado o expirado
   */
  async resetPassword(dto: { token: string; password: string }) {
    const record = await this.passwordReset.findValid(dto.token);

    const usuario = await this.prisma.usuario.findFirst({
      where: { email: record.email },
    });
    if (!usuario) throw new BadRequestException('El enlace no corresponde a un usuario válido');

    const password_hash = await bcrypt.hash(dto.password, 12);

    await this.prisma.$transaction([
      this.prisma.usuario.update({
        where: { id_usuario: usuario.id_usuario },
        data: { password_hash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { used: true },
      }),
      // Cualquier otro enlace pendiente deja de servir
      this.prisma.passwordResetToken.updateMany({
        where: { email: record.email, used: false },
        data: { used: true },
      }),
    ]);

    await this.logAudit({
      userId: usuario.id_usuario,
      userName: usuario.nombre,
      action: 'Restableció su contraseña',
      entity: 'Usuario',
      entityId: usuario.id_usuario,
      detail: 'Recuperación mediante enlace',
    });

    return { success: true, message: 'Contraseña actualizada con éxito' };
  }

  /**
   * Cambia la contraseña de un usuario autenticado.
   * Requiere la contraseña actual para verificar la identidad.
   *
   * @param userId - ID del usuario que solicita el cambio
   * @param dto - Objeto con la contraseña actual y la nueva contraseña
   * @returns Mensaje de confirmación de actualización
   * @throws NotFoundException si el usuario no existe
   * @throws BadRequestException si la contraseña actual es incorrecta
   */
  async changePassword(userId: number, dto: { currentPassword: string; newPassword: string }) {
    const user = await this.prisma.usuario.findUnique({ where: { id_usuario: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const valid = await bcrypt.compare(dto.currentPassword, user.password_hash);
    if (!valid) throw new BadRequestException('Contraseña actual incorrecta');

    const password_hash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.usuario.update({
      where: { id_usuario: userId },
      data: { password_hash },
    });

    await this.logAudit({
      userId,
      userName: user.nombre,
      action: 'Cambió su contraseña',
      entity: 'Usuario',
      entityId: userId,
    });

    return { success: true, message: 'Contraseña actualizada' };
  }

  /**
   * Registra una acción en auditoría sin interrumpir el flujo principal
   * si el registro falla.
   */
  private async logAudit(params: {
    userId?: number;
    userName: string;
    action: string;
    entity: string;
    entityId?: number;
    detail?: string;
  }) {
    try {
      await this.audit.log(params);
    } catch (error: any) {
      this.logger.warn(`No se pudo registrar en auditoría: ${error?.message ?? error}`);
    }
  }

  /**
   * Genera un token JWT para el usuario autenticado.
   *
   * @param id - ID del usuario
   * @param email - Email del usuario
   * @param nombre - Nombre del usuario
   * @param rol - ID del rol del usuario
   * @returns Token JWT firmado
   */
  private signToken(id: number, email: string, nombre: string, rol: number) {
    return this.jwt.sign({ id, email, nombre, rol });
  }
}
