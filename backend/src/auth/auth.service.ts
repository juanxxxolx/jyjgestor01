import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
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
      },
    });

    const token = this.signToken(usuario.id_usuario, usuario.email, usuario.nombre, usuario.id_rol);

    this.audit.log({
      userId: usuario.id_usuario, userName: usuario.nombre,
      action: 'Se registró',
      entity: 'Usuario', entityId: usuario.id_usuario,
    });

    return {
      success: true,
      message: 'Usuario registrado con éxito',
      token,
      user: { id: usuario.id_usuario, nombre: usuario.nombre, email: usuario.email, rol: usuario.id_rol },
    };
  }

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findFirst({
      where: { email: dto.email.toLowerCase().trim(), activo: true },
    });

    if (!usuario) throw new UnauthorizedException('Credenciales inválidas');

    const match = await bcrypt.compare(dto.password, usuario.password_hash);
    if (!match) throw new UnauthorizedException('Credenciales inválidas');

    const token = this.signToken(usuario.id_usuario, usuario.email, usuario.nombre, usuario.id_rol);
    return {
      success: true,
      token,
      user: { id: usuario.id_usuario, nombre: usuario.nombre, email: usuario.email, rol: usuario.id_rol },
    };
  }

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

  private signToken(id: number, email: string, nombre: string, rol: number) {
    return this.jwt.sign({ id, email, nombre, rol });
  }
}
