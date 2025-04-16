//src/reports/reports.controller.ts
import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AddReportDto, UpdateReportDto } from './reports.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all grouped report entries' })
  @ApiResponse({
    status: 200,
    description: 'Grouped report entries fetched successfully',
    type: Object, // More specifically, nested object ReportGroupedDto
  })
  @ApiResponse({ status: 404, description: 'No report entries found' })
  async getReports() {
    return await this.reportsService.getReports();
  }

  @Post(':name')
  @ApiOperation({
    summary: 'Add a new report entry with default status "pending"',
  })
  @ApiResponse({
    status: 201,
    description: 'Report entry created successfully',
    schema: {
      example: {
        type: 'error',
        name: 'serviceX',
        description: 'Service X failed to start',
        status: 'pending',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
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
  @ApiParam({
    name: 'name',
    description: 'Name/identifier for the report group',
    example: 'serviceX',
  })
  @ApiResponse({
    status: 200,
    description: 'Report entry updated successfully',
    schema: {
      example: {
        type: 'error',
        name: 'serviceX',
        description: 'Service X failed to start',
        status: 'resolved',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Report entry not found' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
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
