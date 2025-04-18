// src/definitions/definitions.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class DefinitionNameDto {
  @ApiProperty({
    description: 'Unique name of the definition',
    example: 'custom-definition',
  })
  @IsString()
  @IsNotEmpty({ message: 'Definition name must not be empty' })
  name!: string;
}

export class CreateDefinitionDto {
  @ApiProperty({
    description: 'Unique name of the definition',
    example: 'custom-definition',
  })
  @IsString()
  @IsNotEmpty({ message: 'Definition name must not be empty' })
  name!: string;

  @ApiProperty({
    description: 'Regex pattern for the definition',
    example: '^.*\\.ext$',
  })
  @IsString()
  @IsNotEmpty({ message: 'Format must not be empty' })
  format!: string;

  @ApiPropertyOptional({
    description: 'Optional description of the definition',
    example: 'A custom file format for demonstration',
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateDefinitionDto {
  @ApiProperty({
    description: 'Updated regex pattern for the definition',
    example: '^new-pattern$',
  })
  @IsString()
  @IsNotEmpty({ message: 'Format must not be empty' })
  format!: string;

  @ApiPropertyOptional({
    description: 'Updated description for the definition',
    example: 'Updated description text',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
