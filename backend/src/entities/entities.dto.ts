// src/entities/entities.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class EntityNameDto {
  @IsString()
  @IsNotEmpty({ message: 'Entity name must not be empty' })
  name!: string;
}

export class FieldDto {
  @IsString()
  @IsNotEmpty({ message: 'Field label must not be empty' })
  label!: string;

  @IsString()
  @IsNotEmpty({ message: 'Field type must not be empty' })
  @IsIn(['definition', 'entity'], {
    message: "Field type must be 'definition' or 'entity'",
  })
  type!: 'definition' | 'entity';
}

export class CreateEntityDto {
  @IsString()
  @IsNotEmpty({ message: 'Entity label must not be empty' })
  label!: string;

  @IsArray({ message: 'Fields must be an array' })
  @ValidateNested({ each: true })
  @Type(() => FieldDto)
  fields!: FieldDto[];
}

export class UpdateEntityDto {
  @IsArray({ message: 'Fields must be an array' })
  @ValidateNested({ each: true })
  @Type(() => FieldDto)
  fields!: FieldDto[];
}
