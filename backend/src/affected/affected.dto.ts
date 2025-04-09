import { IsOptional, IsString } from 'class-validator';

export class AffectedDto {
  @IsOptional()
  @IsString()
  format?: string;

  @IsOptional()
  @IsString()
  definition?: string;

  @IsOptional()
  @IsString()
  entity?: string;
}
