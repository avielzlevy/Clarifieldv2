import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AddAnalyticDto } from './analytics.dto';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve analytics data' })
  @ApiResponse({
    status: 200,
    description: 'Analytics data retrieved successfully.',
  })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async getAnalytics() {
    return await this.analyticsService.getAnalytics();
  }

  @Post()
  @ApiOperation({ summary: 'Add a new analytic entry' })
  @ApiResponse({
    status: 201,
    description: 'Analytic entry added successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @ApiBody({
    type: AddAnalyticDto,
    description: 'Data for the new analytic entry',
  })
  async addAnalytic(@Body() dto: AddAnalyticDto) {
    const { type, name, amount } = dto;
    await this.analyticsService.addAnalytic(type, name, amount);
    return {
      type,
      name,
      amount,
    };
  }
}
