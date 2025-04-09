// src/formats/formats.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  NotAcceptableException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import staticFormats from '../data/staticFormats';

export interface FormatData {
  pattern: string;
  description?: string | null;
}

@Injectable()
export class FormatsService {
  constructor(private readonly prisma: PrismaService) {}
  //Utility methods
  async formatExists(name: string): Promise<boolean> {
    const dynamicFormats = await this.prisma.format.findUnique({
      where: { name },
    });
    if (
      dynamicFormats ||
      Object.prototype.hasOwnProperty.call(staticFormats, name)
    )
      return true;
    return false;
  }

  // Service methods
  async getFormats(): Promise<{ [name: string]: FormatData }> {
    try {
      const formats = await this.prisma.format.findMany();
      const dynamicFormats: { [key: string]: FormatData } = {};
      for (const f of formats) {
        dynamicFormats[f.name] = {
          pattern: f.pattern,
          description: f.description,
        };
      }
      return { ...staticFormats, ...dynamicFormats };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.log('Error fetching formats:', error);
      throw new InternalServerErrorException('Failed to fetch formats');
    }
  }

  async addFormat(name: string, data: FormatData): Promise<void> {
    try {
      const existing = await this.prisma.format.findUnique({ where: { name } });
      if (existing) {
        throw new ConflictException('Format already exists');
      }
      await this.prisma.format.create({
        data: { name, pattern: data.pattern, description: data.description },
      });
      //   await addChange({
      //     type: 'formats',
      //     name,
      //     timestamp: new Date().toISOString(),
      //     before: '',
      //     after: { name, pattern, description },
      //   });
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      console.log('Error adding format:', error);
      throw new InternalServerErrorException('Failed to add format');
    }
  }

  async updateFormat(name: string, data: FormatData): Promise<void> {
    try {
      const existing = await this.prisma.format.findUnique({ where: { name } });
      if (!existing) {
        if (Object.prototype.hasOwnProperty.call(staticFormats, name)) {
          throw new NotAcceptableException('Cannot update static format');
        }
        throw new NotFoundException('Format not found');
      }
      await this.prisma.format.update({
        where: { name },
        data: { pattern: data.pattern, description: data.description },
      });
      //   await addChange({
      //     type: 'formats',
      //     name,
      //     timestamp: new Date().toISOString(),
      //     before: dynamicFormats[name],
      //     after: { pattern, description },
      //   });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.log('Error updating format:', error);
      throw new InternalServerErrorException('Failed to update format');
    }
  }
  //TODO: maybe add cleanup for other objects that use this format
  async deleteFormat(name: string): Promise<void> {
    try {
      const existing = await this.prisma.format.findUnique({ where: { name } });
      if (!existing) {
        if (Object.prototype.hasOwnProperty.call(staticFormats, name)) {
          throw new NotAcceptableException('Cannot delete static format');
        }
        throw new NotFoundException('Format not found');
      }
      await this.prisma.format.delete({ where: { name } });
      //   await addChange({
      //     type: 'formats',
      //     name,
      //     timestamp: new Date().toISOString(),
      //     before: dynamicFormats[name],
      //     after: '',
      //   });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.log('Error deleting format:', error);
      throw new InternalServerErrorException('Failed to delete format');
    }
  }
}
