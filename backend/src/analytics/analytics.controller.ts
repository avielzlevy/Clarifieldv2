import { Controller, Get, Post, Body } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AddAnalyticDto } from './analytics.dto';
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  async getAnalytics() {
    return await this.analyticsService.getAnalytics();
  }

  @Post()
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
