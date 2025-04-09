import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateSettingsDto {
  @IsString()
  @IsNotEmpty({ message: 'Naming convention must be provided' })
  namingConvention!: string;
}
