import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface ReportEntry {
  id: number;
  status: string;
  description: string;
}

export type ReportsMap = Record<string, Record<string, ReportEntry[]>>;

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetches all report entries and groups them by type and name.
   */
  async getReports(): Promise<ReportsMap> {
    try {
      const entries = await this.prisma.report.findMany();
      if (!entries || entries.length === 0) {
        throw new NotFoundException('No report entries found');
      }
      const map: ReportsMap = {};
      for (const e of entries) {
        map[e.type] = map[e.type] || {};
        map[e.type][e.name] = map[e.type][e.name] || [];
        map[e.type][e.name].push({
          id: e.id,
          status: e.status,
          description: e.description,
        });
      }
      return map;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error('Error fetching reports:', error);
      throw new InternalServerErrorException('Failed to fetch reports');
    }
  }

  /**
   * Adds a new report entry with default status "pending".
   */
  async addReport(
    type: string,
    name: string,
    description: string,
  ): Promise<void> {
    try {
      await this.prisma.report.create({
        data: { type, name, description, status: 'pending' },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error('Error adding report:', error);
      throw new InternalServerErrorException('Failed to add report');
    }
  }

  /**
   * Updates the status of an existing report entry,
   * identified by type, name, and description.
   */
  async updateReport(
    type: string,
    name: string,
    description: string,
    status: string,
  ): Promise<void> {
    try {
      const result = await this.prisma.report.updateMany({
        where: { type, name, description },
        data: { status },
      });
      if (result.count === 0) {
        throw new NotFoundException('Report entry not found');
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error('Error updating report:', error);
      throw new InternalServerErrorException('Failed to update report');
    }
  }
}
