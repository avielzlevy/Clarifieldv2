import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditLogsService } from './audit.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('logs')
@ApiTags('Audit Logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: 'Retrieve audit logs',
    description: 'Returns all available audit logs.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all audit logs.',
  })
  @ApiBearerAuth()
  async getAuditLogs() {
    const logs = await this.auditLogsService.getAuditLogs();
    return logs;
  }
}
