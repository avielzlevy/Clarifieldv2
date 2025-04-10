import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAuditLogs() {
    try {
      // Retrieve logs ordered by creation date descending (most recent first)
      const logs = await this.prisma.auditLog.findMany({
        orderBy: {
          timestamp: 'desc',
        },
      });
      // Check if logs exist
      if (!logs || logs.length === 0) {
        throw new NotFoundException('No logs found');
      }
      return logs;
    } catch (error) {
      console.error('Failed to retrieve logs:', error);
      throw new InternalServerErrorException('Failed to retrieve logs');
    }
  }
}
