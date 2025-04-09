import { Injectable, NotFoundException } from '@nestjs/common';
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
    const entries = await this.prisma.report.findMany();
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
  }

  /**
   * Adds a new report entry with default status "pending".
   */
  async addReport(
    type: string,
    name: string,
    description: string,
  ): Promise<void> {
    await this.prisma.report.create({
      data: { type, name, description, status: 'pending' },
    });
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
    const result = await this.prisma.report.updateMany({
      where: { type, name, description },
      data: { status },
    });
    if (result.count === 0) {
      throw new NotFoundException('Report entry not found');
    }
  }
}
