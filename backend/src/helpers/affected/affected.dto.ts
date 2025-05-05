import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
export class AffectedDto {
  @ApiPropertyOptional({
    description: 'The affected format',
    example: 'Text',
  })
  @IsOptional()
  @IsString()
  format?: string;

  @ApiPropertyOptional({
    description: 'The affected definition',
    example: 'Text',
  })
  @IsOptional()
  @IsString()
  definition?: string;

  @ApiPropertyOptional({
    description: 'The affected entity',
    example: 'Text',
  })
  @IsOptional()
  @IsString()
  entity?: string;
}
