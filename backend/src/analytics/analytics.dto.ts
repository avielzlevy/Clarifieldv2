import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

/**
 * DTO for POST /api/analytic
 */
export class AddAnalyticDto {
  @IsNotEmpty()
  @IsString()
  type!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsNumber()
  amount!: number;
}
