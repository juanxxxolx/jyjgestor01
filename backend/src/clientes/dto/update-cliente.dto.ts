/**
 * @fileoverview DTO para la actualización parcial de un cliente.
 * Extiende CreateClienteDto haciendo todos sus campos opcionales.
 */
import { PartialType } from '@nestjs/mapped-types';
import { CreateClienteDto } from './create-cliente.dto';

export class UpdateClienteDto extends PartialType(CreateClienteDto) {}
