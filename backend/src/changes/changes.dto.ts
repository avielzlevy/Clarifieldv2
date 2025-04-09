import { IsString, IsNotEmpty, IsDefined } from 'class-validator';

export class CreateChangeDto {
  @IsString()
  @IsNotEmpty({ message: 'Change type must not be empty' })
  type!: string;

  @IsString()
  @IsNotEmpty({ message: 'Change name must not be empty' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Timestamp must not be empty' })
  timestamp!: string;

  // Using IsDefined to allow both objects and strings.
  @IsDefined({ message: 'Before state must be provided' })
  before!: object | string;

  @IsDefined({ message: 'After state must be provided' })
  after!: object | string;
}
