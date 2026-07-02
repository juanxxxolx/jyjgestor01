import { IsEmail, IsString, MinLength, MaxLength, Matches, IsOptional, IsInt } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3, { message: 'Nombre mínimo 3 caracteres' })
  @MaxLength(100)
  nombre: string;

  @IsEmail({}, { message: 'Email no válido' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Contraseña mínimo 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'La contraseña debe tener mayúscula, minúscula, número y símbolo (@$!%*?&)',
  })
  password: string;

  @IsOptional()
  @IsInt()
  id_rol?: number;
}
