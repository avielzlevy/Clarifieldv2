// src/reports/reports.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for POST /reports/:name
 */
export class AddReportDto {
  @ApiProperty({
    description: 'Type of the report entry',
    example: 'error',
  })
  @IsNotEmpty()
  @IsString()
  type!: string;

  @ApiProperty({
    description: 'Description of the report entry',
    example: 'Service X failed to start',
  })
  @IsNotEmpty()
  @IsString()
  description!: string;
}

/**
 * DTO for PUT /reports/:name
 */
export class UpdateReportDto {
  @ApiProperty({
    description: 'Type of the report entry',
    example: 'error',
  })
  @IsNotEmpty()
  @IsString()
  type!: string;

  @ApiProperty({
    description: 'Description of the report entry',
    example: 'Service X failed to start',
  })
  @IsNotEmpty()
  @IsString()
  description!: string;

  @ApiProperty({
    description: 'Status of the report entry',
    example: 'resolved',
  })
  @IsNotEmpty()
  @IsString()
  status!: string;
}
