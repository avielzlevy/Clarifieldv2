import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateChangeDto } from './changes.dto';

@Injectable()
export class ChangesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves all changes grouped by their type.
   */
  async getChanges(): Promise<Record<string, any[]>> {
    try {
      // Query all changes from PostgreSQL
      const changes = await this.prisma.change.findMany();
      // Group changes by type
      const grouped = changes.reduce(
        (acc, change) => {
          if (!acc[change.type]) acc[change.type] = [];
          acc[change.type].push(change);
          return acc;
        },
        {} as Record<string, any[]>,
      );
      return grouped;
    } catch (error) {
      console.error('Error fetching changes:', error);
      throw new InternalServerErrorException('Failed to fetch changes');
    }
  }

  /**
   * Adds a change record to the database.
   */
  async addChange(change: CreateChangeDto): Promise<void> {
    const { type, name, timestamp, before, after } = change;
    try {
      await this.prisma.change.create({
        data: {
          type,
          name,
          // Converting the timestamp string to a Date object
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
