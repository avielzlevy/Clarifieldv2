// src/formats/formats.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface FormatData {
  pattern: string;
  description?: string | null;
}

@Injectable()
export class FormatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getFormats(): Promise<{ [name: string]: FormatData }> {
    const formats = await this.prisma.format.findMany();
    const result: { [key: string]: FormatData } = {};
    for (const f of formats) {
      result[f.name] = { pattern: f.pattern, description: f.description };
    }
    return result;
  }

  async formatExists(name: string): Promise<boolean> {
    const format = await this.prisma.format.findUnique({ where: { name } });
    return format !== null;
  }

  async addFormat(name: string, data: FormatData): Promise<void> {
    const existing = await this.prisma.format.findUnique({ where: { name } });
    if (existing) {
      throw new Error('Format already exists');
    }
    await this.prisma.format.create({
      data: { name, pattern: data.pattern, description: data.description },
    });
  }

  async updateFormat(name: string, data: FormatData): Promise<void> {
    const existing = await this.prisma.format.findUnique({ where: { name } });
    if (!existing) {
      throw new Error('Format not found');
    }
    await this.prisma.format.update({
      where: { name },
      data: { pattern: data.pattern, description: data.description },
    });
  }

  async deleteFormat(name: string): Promise<void> {
    const existing = await this.prisma.format.findUnique({ where: { name } });
    if (!existing) {
      throw new Error('Format not found');
    }
    await this.prisma.format.delete({ where: { name } });
  }
}
