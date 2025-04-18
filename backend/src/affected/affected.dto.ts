import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
export class AffectedDto {
  @ApiProperty({
    description: 'The affected format',
    example: 'Text',
  })
  @IsOptional()
  @IsString()
  format?: string;

  @ApiProperty({
    description: 'The affected definition',
    example: 'Text',
  })
  @IsOptional()
  @IsString()
  definition?: string;

  @ApiProperty({
    description: 'The affected entity',
    example: 'Text',
  })
  @IsOptional()
  @IsString()
  entity?: string;
}
