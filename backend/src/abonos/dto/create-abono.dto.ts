import { IsInt, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAbonoDto {
  @IsInt()
  @Min(1, { message: 'ID de cliente inválido' })
  @Type(() => Number)
  id_cliente: number;

  @IsNumber()
  @Min(0.01, { message: 'El monto debe ser mayor a 0' })
  @Type(() => Number)
  monto: number;
}
