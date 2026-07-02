import { IsString, IsEmail, IsOptional, MaxLength, IsPhoneNumber } from 'class-validator';

export class CreateClienteDto {
  @IsString()
  @MaxLength(200)
  nombre: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email no válido' })
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  direccion?: string;
}
