import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateSettingsDto {
  @ApiProperty({
    description: 'Naming convention for the application',
    example: 'camelCase',
  })
  @IsString()
  @IsNotEmpty({ message: 'Naming convention must be provided' })
  namingConvention!: string;
}
