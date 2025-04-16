//src/reports/reports.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for POST /reports/:name
 */
export class AddReportDto {
  @IsNotEmpty()
  @IsString()
  type!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;
}

/**
 * DTO for PUT /reports/:name
 */
export class UpdateReportDto {
  @IsNotEmpty()
  @IsString()
  type!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsNotEmpty()
  @IsString()
  status!: string;
}
