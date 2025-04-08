// src/definitions/definitions.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface DefinitionData {
  format: string;
  description?: string | null;
}

@Injectable()
export class DefinitionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDefinitions(): Promise<Record<string, DefinitionData>> {
    const definitions = await this.prisma.definition.findMany();
    const result: Record<string, DefinitionData> = {};
    for (const def of definitions) {
      result[def.name] = { format: def.format, description: def.description };
    }
    return result;
  }

  async getDefinition(name: string): Promise<DefinitionData | null> {
    const def = await this.prisma.definition.findUnique({ where: { name } });
    return def ? { format: def.format, description: def.description } : null;
  }

  async addDefinition(name: string, data: DefinitionData): Promise<void> {
    const existing = await this.prisma.definition.findUnique({
      where: { name },
    });
    if (existing) {
      throw new Error('Definition already exists');
    }
    await this.prisma.definition.create({
      data: { name, format: data.format, description: data.description },
    });
  }

  async updateDefinition(name: string, data: DefinitionData): Promise<void> {
    const existing = await this.prisma.definition.findUnique({
      where: { name },
    });
    if (!existing) {
      throw new Error('Definition not found');
    }
    await this.prisma.definition.update({
      where: { name },
      data: { format: data.format, description: data.description },
    });
  }

  async deleteDefinition(name: string): Promise<void> {
    const existing = await this.prisma.definition.findUnique({
      where: { name },
    });
    if (!existing) {
      throw new Error('Definition not found');
    }
    await this.prisma.definition.delete({ where: { name } });
  }
}
