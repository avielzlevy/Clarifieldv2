import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditLogsService } from './audit.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  async getAuditLogs() {
    const logs = await this.auditLogsService.getAuditLogs();
    return logs;
  }
}
