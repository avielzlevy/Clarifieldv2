import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class FormatNameDto {
  @IsString()
  @IsNotEmpty({ message: 'Format name must not be empty' })
  name!: string;
}
export class CreateFormatDto {
  @IsString()
  @IsNotEmpty({ message: 'Format name must not be empty' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Pattern must not be empty' })
  pattern!: string;

  @IsString()
  @IsOptional()
  description?: string;
}
export class UpdateFormatDto {
  @IsString()
  @IsNotEmpty({ message: 'Pattern must not be empty' })
  pattern!: string;

  @IsString()
  @IsOptional()
  description?: string;
}
