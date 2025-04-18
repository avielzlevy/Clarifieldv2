import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

/**
 * DTO for POST /api/analytic
 */
export class AddAnalyticDto {
  @ApiProperty({
    description: 'The type of the analytic entry',
    example: 'Text',
  })
  @IsNotEmpty()
  @IsString()
  type!: string;

  @ApiProperty({
    description: 'The name of the analytic entry',
    example: 'Text',
  })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'The amount of the analytic entry',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  amount!: number;
}
