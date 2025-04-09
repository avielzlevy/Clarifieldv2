import {
  Injectable,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type AnalyticsMap = Record<string, Record<string, number>>;

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetches all analytics and returns a nested map: { [type]: { [name]: amount } }
   */
  async getAnalytics(): Promise<AnalyticsMap> {
    try {
      const rows = await this.prisma.analytic.findMany();
      const result: AnalyticsMap = {};
      for (const row of rows) {
        if (!result[row.type]) {
          result[row.type] = {};
        }
        result[row.type][row.name] = row.amount;
      }
      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error('Error fetching analytics:', error);
      throw new InternalServerErrorException('Failed to fetch analytics');
    }
  }

  /**
   * Adds (or increments) an analytic record.
   */
  async addAnalytic(type: string, name: string, amount: number): Promise<void> {
    // Upsert: if exists, increment; otherwise create new
    await this.prisma.analytic.upsert({
      where: { type_name: { type, name } },
      create: { type, name, amount },
      update: { amount: { increment: amount } },
    });
  }
}
