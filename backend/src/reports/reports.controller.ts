import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AddReportDto, UpdateReportDto } from './reports.dto';
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  async getReports() {
    return await this.reportsService.getReports();
  }

  @Post(':name')
  async addReport(@Param('name') name: string, @Body() dto: AddReportDto) {
    const { type, description } = dto;
    await this.reportsService.addReport(type, name, description);
    return {
      type,
      name,
      description,
      status: 'pending',
    };
  }

  @Put(':name')
  async updateReport(
    @Param('name') name: string,
    @Body() dto: UpdateReportDto,
  ) {
    const { type, description, status } = dto;
    await this.reportsService.updateReport(type, name, description, status);
    return {
      type,
      name,
      description,
      status,
    };
  }
}
