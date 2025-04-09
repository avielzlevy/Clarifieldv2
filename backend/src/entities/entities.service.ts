// src/entities/entities.service.ts
import {
  Injectable,
  HttpException,
  NotFoundException,
  ConflictException,
  NotAcceptableException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { DefinitionsService } from '../definitions/definitions.service';
import { EntityData, Field } from './entities.types';

@Injectable()
export class EntitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly definitionsService: DefinitionsService,
  ) {}

  async getEntities(): Promise<Record<string, EntityData>> {
    try {
      const entities = await this.prisma.entity.findMany();
      const result: Record<string, EntityData> = {};
      for (const entity of entities) {
        result[entity.label] = {
          label: entity.label,
          fields: entity.fields as unknown as Field[],
        };
      }
      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error('Error fetching entities:', error);
      throw new InternalServerErrorException('Failed to fetch entities');
    }
  }

  async getEntity(label: string): Promise<EntityData> {
    try {
      const entity = await this.prisma.entity.findUnique({ where: { label } });
      if (!entity) throw new NotFoundException('Entity not found');
      return {
        label: entity.label,
        fields: entity.fields as unknown as Field[],
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error('Error fetching entity:', error);
      throw new InternalServerErrorException('Failed to fetch entity');
    }
  }

  async addEntity(label: string, data: EntityData): Promise<void> {
    try {
      // Check for duplicate entity.
      const existing = await this.prisma.entity.findUnique({
        where: { label },
      });
      if (existing) throw new ConflictException('Entity already exists');

      // Validate each field.
      for (const field of data.fields) {
        if (!field.label || !field.type) {
          throw new NotAcceptableException(
            'Field label and type must be provided',
          );
        }
        if (field.type === 'definition') {
          // This will throw if the definition does not exist.
          await this.definitionsService.getDefinition(field.label);
        } else if (field.type === 'entity') {
          // Validate that the referenced entity exists (avoid self-reference if needed).
          const referenced = await this.prisma.entity.findUnique({
            where: { label: field.label },
          });
          if (!referenced) {
            throw new NotAcceptableException(
              `Referenced entity '${field.label}' does not exist`,
            );
          }
        } else {
          throw new NotAcceptableException(
            "Field type must be either 'definition' or 'entity'",
          );
        }
      }

      await this.prisma.entity.create({
        data: {
          label,
          fields: data.fields as unknown as Prisma.JsonArray,
        },
      });
      // Optionally, add logging or change tracking here.
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error('Error adding entity:', error);
      throw new InternalServerErrorException('Failed to add entity');
    }
  }

  async updateEntity(label: string, data: EntityData): Promise<void> {
    try {
      const existing = await this.prisma.entity.findUnique({
        where: { label },
      });
      if (!existing) throw new NotFoundException('Entity not found');

      // Validate each field as in addEntity.
      for (const field of data.fields) {
        if (!field.label || !field.type) {
          throw new NotAcceptableException(
            'Field label and type must be provided',
          );
        }
        if (field.type === 'definition') {
          await this.definitionsService.getDefinition(field.label);
        } else if (field.type === 'entity') {
          const referenced = await this.prisma.entity.findUnique({
            where: { label: field.label },
          });
          if (!referenced) {
            throw new NotAcceptableException(
              `Referenced entity '${field.label}' does not exist`,
            );
          }
        } else {
          throw new NotAcceptableException(
            "Field type must be either 'definition' or 'entity'",
          );
        }
      }

      // If the label is changing, you might want to handle key updates in your DB.
      await this.prisma.entity.update({
        where: { label },
        data: {
          label: data.label,
          fields: data.fields as unknown as Prisma.JsonArray,
        },
      });
      // Optionally, add change logging here.
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error('Error updating entity:', error);
      throw new InternalServerErrorException('Failed to update entity');
    }
  }

  async deleteEntity(label: string): Promise<void> {
    try {
      const existing = await this.prisma.entity.findUnique({
        where: { label },
      });
      if (!existing) throw new NotFoundException('Entity not found');

      await this.prisma.entity.delete({ where: { label } });
      // Optionally: remove references to this entity from other entities if needed.
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error('Error deleting entity:', error);
      throw new InternalServerErrorException('Failed to delete entity');
    }
  }

  async renameEntity(originalLabel: string, newLabel: string): Promise<void> {
    try {
      // Verify that no entity with the new label exists.
      const existing = await this.prisma.entity.findUnique({
        where: { label: newLabel },
      });
      if (existing) {
        throw new ConflictException('Entity with new label already exists');
      }
      // Update the entity's label.
      await this.prisma.entity.update({
        where: { label: originalLabel },
        data: { label: newLabel },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error('Error renaming entity:', error);
      throw new InternalServerErrorException('Failed to rename entity');
    }
  }
}
