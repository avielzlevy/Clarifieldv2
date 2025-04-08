// src/definitions/definitions.service.ts
import {
  Injectable,
  HttpException,
  NotAcceptableException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FormatsService } from '../formats/formats.service';

export interface DefinitionData {
  format: string;
  description?: string | null;
}

@Injectable()
export class DefinitionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly formatsService: FormatsService,
  ) {}

  async getDefinitions(): Promise<Record<string, DefinitionData>> {
    try {
      const definitions = await this.prisma.definition.findMany();
      const result: Record<string, DefinitionData> = {};
      for (const def of definitions) {
        result[def.name] = { format: def.format, description: def.description };
      }
      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log('Error fetching definitions:', error);
      throw new InternalServerErrorException('Failed to fetch definitions');
    }
  }

  async getDefinition(name: string): Promise<DefinitionData | null> {
    try {
      const def = await this.prisma.definition.findUnique({ where: { name } });
      if (!def) throw new NotFoundException('Definition not found');
      return { format: def.format, description: def.description };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log('Error fetching definition:', error);
      throw new InternalServerErrorException('Failed to fetch definition');
    }
  }

  async addDefinition(name: string, data: DefinitionData): Promise<void> {
    try {
      const existing = await this.prisma.definition.findUnique({
        where: { name },
      });
      if (existing) throw new ConflictException('Definition already exists');
      if (!(await this.formatsService.formatExists(data.format)))
        throw new NotAcceptableException('Format does not exist');
      await this.prisma.definition.create({
        data: { name, format: data.format, description: data.description },
      });
      //   await addChange({
      //     type: 'definitions',
      //     name,
      //     timestamp: new Date().toISOString(),
      //     before: '',
      //     after: { name, format, description },
      //   });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log('Error adding definition:', error);
      throw new InternalServerErrorException('Failed to add definition');
    }
  }

  async updateDefinition(name: string, data: DefinitionData): Promise<void> {
    try {
      const existing = await this.prisma.definition.findUnique({
        where: { name },
      });
      if (!existing) throw new NotFoundException('Definition not found');
      if (!(await this.formatsService.formatExists(data.format)))
        throw new NotAcceptableException('Format does not exist');
      await this.prisma.definition.update({
        where: { name },
        data: { format: data.format, description: data.description },
      });
      // await addChange({
      //   type: 'definitions',
      //   name,
      //   timestamp: new Date().toISOString(),
      //   before: existingDefinition,
      //   after: { name, format, description },
      // });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log('Error updating definition:', error);
      throw new InternalServerErrorException('Failed to update definition');
    }
  }
  //TODO: maybe add cleanup for other objects that use this definition
  async deleteDefinition(name: string): Promise<void> {
    try {
      const existing = await this.prisma.definition.findUnique({
        where: { name },
      });
      if (!existing) throw new NotFoundException('Definition not found');
      await this.prisma.definition.delete({ where: { name } });
      //   await addChange({
      //     type: 'definitions',
      //     name,
      //     timestamp: new Date().toISOString(),
      //     before: definition,
      //     after: '',
      //   });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log('Error deleting definition:', error);
      throw new InternalServerErrorException('Failed to delete definition');
    }
  }
}
