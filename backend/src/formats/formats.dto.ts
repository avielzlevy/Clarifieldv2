import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FormatNameDto {
  @ApiProperty({
    description: 'Unique name of the format',
    example: 'custom-format',
  })
  @IsString()
  @IsNotEmpty({ message: 'Format name must not be empty' })
  name!: string;
}

export class CreateFormatDto {
  @ApiProperty({
    description: 'Unique name of the format',
    example: 'custom-format',
  })
  @IsString()
  @IsNotEmpty({ message: 'Format name must not be empty' })
  name!: string;

  @ApiProperty({
    description: 'Regex pattern for the format',
    example: '^.*\\.ext$',
  })
  @IsString()
  @IsNotEmpty({ message: 'Pattern must not be empty' })
  pattern!: string;

  @ApiPropertyOptional({
    description: 'Optional description of the format',
    example: 'A custom file format for demonstration',
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateFormatDto {
  @ApiProperty({
    description: 'Updated regex pattern for the format',
    example: '^new-pattern$',
  })
  @IsString()
  @IsNotEmpty({ message: 'Pattern must not be empty' })
  pattern!: string;

  @ApiPropertyOptional({
    description: 'Updated description for the format',
    example: 'Updated description text',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
