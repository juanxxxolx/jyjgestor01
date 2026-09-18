/**
 * @fileoverview Servicio de autenticación y gestión de usuarios.
 * Proporciona funcionalidades de registro, inicio de sesión,
 * recuperación de contraseña (forgot/reset), cambio de contraseña
 * y generación de tokens JWT. Utiliza bcrypt para el hash de
 * contraseñas y JWT para la creación de tokens de acceso.
 */
import { Injectable, ConflictException, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private audit: AuditService,
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
   * Genera un token JWT con propósito 'password_reset' y lo almacena
   * en la base de datos con fecha de expiración de 1 hora.
   *
   * @param dto - Objeto con el email del usuario
   * @returns Mensaje indicando que si el email existe, se enviará un enlace
   */
  async forgotPassword(dto: { email: string }) {
    const email = dto.email.toLowerCase().trim();
    const usuario = await this.prisma.usuario.findFirst({
      where: { email, activo: true },
    });

    if (!usuario) {
      return { success: true, message: 'Si el email está registrado, recibirás un enlace de recuperación' };
    }

    const token = this.jwt.sign(
      { id: usuario.id_usuario, purpose: 'password_reset' },
      { expiresIn: '1h' },
    );

    const expires_at = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: { email, token, expires_at },
    });

    return {
      success: true,
      message: 'Token generado (modo desarrollo)',
      token,
    };
  }

  /**
   * Restablece la contraseña usando un token de recuperación válido.
   * Verifica que el token exista, no haya sido usado y no esté expirado.
   * Actualiza la contraseña del usuario y marca el token como usado.
   *
   * @param dto - Objeto con el token y la nueva contraseña
   * @returns Mensaje de confirmación de actualización
   * @throws UnauthorizedException si el token es inválido, usado o expirado
   */
  async resetPassword(dto: { token: string; password: string }) {
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { token: dto.token },
    });

    if (!record || record.used || record.expires_at < new Date()) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    const password_hash = await bcrypt.hash(dto.password, 12);

    await Promise.all([
      this.prisma.usuario.update({
        where: { email: record.email },
        data: { password_hash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { used: true },
      }),
    ]);

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

    return { success: true, message: 'Contraseña actualizada' };
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
