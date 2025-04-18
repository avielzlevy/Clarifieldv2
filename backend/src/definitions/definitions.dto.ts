// src/definitions/definitions.dto.ts
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class DefinitionNameDto {
  @IsString()
  @IsNotEmpty({ message: 'Definition name must not be empty' })
  name!: string;
}

export class CreateDefinitionDto {
  @IsString()
  @IsNotEmpty({ message: 'Definition name must not be empty' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Format must not be empty' })
  format!: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateDefinitionDto {
  @IsString()
  @IsNotEmpty({ message: 'Format must not be empty' })
  format!: string;

  @IsString()
  @IsOptional()
  description?: string;
}
