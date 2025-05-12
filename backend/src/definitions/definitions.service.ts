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
import { ChangesService } from '../changes/changes.service';

export interface DefinitionData {
  format: string;
  description?: string | null;
}

@Injectable()
export class DefinitionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly formatsService: FormatsService,
    private readonly changesService: ChangesService,
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
    const { format, description } = data;
    try {
      const existing = await this.prisma.definition.findUnique({
        where: { name },
      });
      if (existing) throw new ConflictException('Definition already exists');
      if (!(await this.formatsService.formatExists(data.format))) {
        console.log(`Format ${data.format} does not exist`);
        throw new NotAcceptableException('Format does not exist');
      }
      await this.prisma.definition.create({
        data: { name, format, description },
      });
      await this.changesService.addChange({
        type: 'definitions',
        name,
        timestamp: new Date().toISOString(),
        before: '',
        after: { name, format, description },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log('Error adding definition:', error);
      throw new InternalServerErrorException('Failed to add definition');
    }
  }

  async updateDefinition(name: string, data: DefinitionData): Promise<void> {
    const { format, description } = data;
    try {
      const existing = await this.prisma.definition.findUnique({
        where: { name },
      });
      if (!existing) throw new NotFoundException('Definition not found');
      if (!(await this.formatsService.formatExists(data.format)))
        throw new NotAcceptableException('Format does not exist');
      await this.prisma.definition.update({
        where: { name },
        data: { format: format, description },
      });
      await this.changesService.addChange({
        type: 'definitions',
        name,
        timestamp: new Date().toISOString(),
        before: existing,
        after: { name, format, description },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log('Error updating definition:', error);
      throw new InternalServerErrorException('Failed to update definition');
    }
  }
  async deleteDefinition(name: string): Promise<void> {
    try {
      const existing = await this.prisma.definition.findUnique({
        where: { name },
      });
      if (!existing) throw new NotFoundException('Definition not found');
      await this.prisma.definition.delete({ where: { name } });
      await this.changesService.addChange({
        type: 'definitions',
        name,
        timestamp: new Date().toISOString(),
        before: existing,
        after: '',
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log('Error deleting definition:', error);
      throw new InternalServerErrorException('Failed to delete definition');
    }
  }
  async renameDefinition(originalName: string, newName: string): Promise<void> {
    try {
      // Check if newName already exists.
      const existing = await this.prisma.definition.findUnique({
        where: { name: newName },
      });
      if (existing) {
        throw new ConflictException('Definition with new name already exists');
      }
      // Update the definition's name.
      await this.prisma.definition.update({
        where: { name: originalName },
        data: { name: newName },
      });
      await this.changesService.addChange({
        type: 'definitions',
        name: originalName,
        timestamp: new Date().toISOString(),
        before: { name: originalName },
        after: { name: newName },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error('Error renaming definition:', error);
      throw new InternalServerErrorException('Failed to rename definition');
    }
  }
}
