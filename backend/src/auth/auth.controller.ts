/**
 * @fileoverview Controlador de autenticación.
 * Expone los endpoints públicos para registro, inicio de sesión,
 * recuperación de contraseña y cambio de contraseña (este último
 * requiere autenticación JWT).
 */
import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { IsString, MinLength, Matches } from 'class-validator';

/**
 * DTO para el cambio de contraseña desde el controlador.
 * No está exportado y se usa exclusivamente en el endpoint change-password.
 */
class ChangePasswordDto {
  @IsString()
  @MinLength(1, { message: 'Contraseña actual requerida' })
  currentPassword: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
    message: 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un símbolo',
  })
  newPassword: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Registra un nuevo usuario en el sistema.
   *
   * @param dto - Datos del registro (nombre, email, contraseña, rol opcional)
   * @returns Mensaje de éxito y confirmación de registro pendiente de aprobación
   */
  @Post('registro')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * Inicia sesión con email y contraseña.
   *
   * @param dto - Credenciales de inicio de sesión
   * @returns Token JWT y datos del usuario autenticado
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * Solicita un token de recuperación de contraseña.
   *
   * @param dto - Email del usuario
   * @returns Mensaje de confirmación del proceso
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  /**
   * Restablece la contraseña usando un token de recuperación.
   *
   * @param dto - Token y nueva contraseña
   * @returns Mensaje de confirmación de actualización
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  /**
   * Cambia la contraseña del usuario autenticado.
   * Requiere estar autenticado mediante JWT.
   *
   * @param dto - Contraseña actual y nueva contraseña
   * @param req - Objeto de solicitud HTTP (contiene el usuario autenticado)
   * @returns Mensaje de confirmación del cambio
   */
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  changePassword(@Body() dto: ChangePasswordDto, @Req() req: any) {
    return this.authService.changePassword(req.user.id, dto);
  }
}
