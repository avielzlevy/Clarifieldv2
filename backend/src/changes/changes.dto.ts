import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDefined } from 'class-validator';

export class CreateChangeDto {
  @ApiProperty({
    description: 'Type of the change (e.g., "create", "update", "delete")',
    example: 'create',
  })
  @IsString()
  @IsNotEmpty({ message: 'Change type must not be empty' })
  type!: string;

  @ApiProperty({
    description: 'Name of the change',
    example: 'New feature added',
  })
  @IsString()
  @IsNotEmpty({ message: 'Change name must not be empty' })
  name!: string;

  @ApiProperty({
    description: 'Timestamp of the change in ISO format',
    example: '2023-10-01T12:00:00Z',
  })
  @IsString()
  @IsNotEmpty({ message: 'Timestamp must not be empty' })
  timestamp!: string;

  @ApiProperty({
    description: 'Description of the change',
    example: 'Added a new feature to improve user experience',
  })
  @IsDefined({ message: 'Before state must be provided' })
  before!: object | string;

  @ApiProperty({
    description: 'Description of the change',
    example: 'Added a new feature to improve user experience',
  })
  @IsDefined({ message: 'After state must be provided' })
  after!: object | string;
}
