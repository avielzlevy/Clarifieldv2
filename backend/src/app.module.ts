import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { FormatsController } from './formats/formats.controller';
import { FormatsService } from './formats/formats.service';
import { DefinitionsController } from './definitions/definitions.controller';
import { DefinitionsService } from './definitions/definitions.service';
import { EntitiesController } from './entities/entities.controller';
import { EntitiesService } from './entities/entities.service';
import { AnalyticsController } from './analytics/analytics.controller';
import { AnalyticsService } from './analytics/analytics.service';
import { ReportsController } from './reports/reports.controller';
import { ReportsService } from './reports/reports.service';

@Module({
  imports: [AuthModule],
  controllers: [
    FormatsController,
    DefinitionsController,
    EntitiesController,
    AnalyticsController,
    ReportsController,
  ],
  providers: [
    PrismaService,
    FormatsService,
    DefinitionsService,
    EntitiesService,
    AnalyticsService,
    ReportsService,
  ],
})
export class AppModule {}
