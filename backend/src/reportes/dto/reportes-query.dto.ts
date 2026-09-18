import { IsOptional, IsString, Matches } from 'class-validator';

/** Acepta fechas en formato puro YYYY-MM-DD o en ISO completo (con hora y Z). */
const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z?)?$/;

export class ReportesQueryDto {
  @IsOptional()
  @IsString()
  @Matches(FECHA_REGEX, {
    message: 'Formato de fecha inválido. Use YYYY-MM-DD (opcionalmente con hora según ISO 8601)',
  })
  desde?: string;

  @IsOptional()
  @IsString()
  @Matches(FECHA_REGEX, {
    message: 'Formato de fecha inválido. Use YYYY-MM-DD (opcionalmente con hora según ISO 8601)',
  })
  hasta?: string;
}
