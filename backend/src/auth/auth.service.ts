import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
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

  private signToken(id: number, email: string, nombre: string, rol: number) {
    return this.jwt.sign({ id, email, nombre, rol });
  }
}
