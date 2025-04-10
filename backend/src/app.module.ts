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
import { ChangesController } from './changes/changes.controller';
import { ChangesService } from './changes/changes.service';
import { SettingsController } from './settings/settings.controller';
import { SettingsService } from './settings/settings.service';
import { ValidateController } from './validate/validate.controller';
import { ValidateService } from './validate/validate.service';
import { AuditLogsController } from './audit/audit.controller';
import { AuditLogsService } from './audit/audit.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLoggerInterceptor } from './interceptors/audit.interceptor';

@Module({
  imports: [AuthModule],
  controllers: [
    FormatsController,
    DefinitionsController,
    EntitiesController,
    AnalyticsController,
    ReportsController,
    ChangesController,
    SettingsController,
    ValidateController,
    AuditLogsController,
  ],
  providers: [
    PrismaService,
    FormatsService,
    DefinitionsService,
    EntitiesService,
    AnalyticsService,
    ReportsService,
    ChangesService,
    SettingsService,
    ValidateService,
    AuditLogsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLoggerInterceptor,
    },
  ],
})
export class AppModule {}
