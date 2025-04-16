import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class EntityNameDto {
  @ApiProperty({
    description: 'The name (label) of the entity',
    example: 'User',
  })
  @IsString()
  @IsNotEmpty({ message: 'Entity name must not be empty' })
  name!: string;
}

export class FieldDto {
  @ApiProperty({
    description: 'Label of the field',
    example: 'email',
  })
  @IsString()
  @IsNotEmpty({ message: 'Field label must not be empty' })
  label!: string;

  @ApiProperty({
    description: "Type of the field — either 'definition' or 'entity'",
    example: 'definition',
    enum: ['definition', 'entity'],
  })
  @IsString()
  @IsNotEmpty({ message: 'Field type must not be empty' })
  @IsIn(['definition', 'entity'], {
    message: "Field type must be 'definition' or 'entity'",
  })
  type!: 'definition' | 'entity';
}

export class CreateEntityDto {
  @ApiProperty({
    description: 'Label of the entity to be created',
    example: 'Product',
  })
  @IsString()
  @IsNotEmpty({ message: 'Entity label must not be empty' })
  label!: string;

  @ApiProperty({
    description: 'List of fields in the entity',
    type: [FieldDto],
  })
  @IsArray({ message: 'Fields must be an array' })
  @ValidateNested({ each: true })
  @Type(() => FieldDto)
  fields!: FieldDto[];
}

export class UpdateEntityDto {
  @ApiProperty({
    description: 'New list of fields to update the entity with',
    type: [FieldDto],
  })
  @IsArray({ message: 'Fields must be an array' })
  @ValidateNested({ each: true })
  @Type(() => FieldDto)
  fields!: FieldDto[];
}
