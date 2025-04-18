import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateChangeDto } from './changes.dto';
import { Change } from '@prisma/client';

@Injectable()
export class ChangesService {
  constructor(private readonly prisma: PrismaService) {}

  async getChanges(): Promise<Record<string, Change[]>> {
    try {
      const changes = await this.prisma.change.findMany();
      const grouped = changes.reduce(
        (acc, change) => {
          if (!acc[change.type]) acc[change.type] = [];
          acc[change.type].push(change);
          return acc;
        },
        {} as Record<string, Change[]>,
      );
      return grouped;
    } catch (error) {
      console.error('Error fetching changes:', error);
      throw new InternalServerErrorException('Failed to fetch changes');
    }
  }

  async addChange(change: CreateChangeDto): Promise<void> {
    const { type, name, timestamp, before, after } = change;
    try {
      await this.prisma.change.create({
        data: {
          type,
          name,
          timestamp: new Date(timestamp),
          before,
          after,
        },
      });
    } catch (error) {
      console.error('Error adding change:', error);
      throw new InternalServerErrorException('Failed to add change');
    }
  }
}
