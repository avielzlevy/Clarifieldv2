import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateSettingsDto } from './settings.dto';
import { DefinitionsService } from '../definitions/definitions.service';
import { EntitiesService } from '../entities/entities.service';
import { AnalyticsService } from '../analytics/analytics.service';
import {
  toPascalCase,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  // transformKeys,
  // transformEntityKeys,
} from '../helpers/nameConvert';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly definitionsService: DefinitionsService,
    private readonly entitiesService: EntitiesService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  /**
   * Retrieve the settings record; if none exists, create one with default settings.
   */
  async getSettings(): Promise<{ id: number; namingConvention: string }> {
    let setting = await this.prisma.setting.findUnique({ where: { id: 1 } });
    if (!setting) {
      setting = await this.prisma.setting.create({
        data: { namingConvention: 'snake_case' },
      });
    }
    return setting;
  }

  /**
   * Update settings and apply naming convention changes.
   */
  async updateSettings(
    updateDto: UpdateSettingsDto,
  ): Promise<{ id: number; namingConvention: string }> {
    const { namingConvention } = updateDto;
    // Update the settings record.
    const currentSettings = await this.getSettings();
    const updatedSettings = await this.prisma.setting.update({
      where: { id: currentSettings.id },
      data: { namingConvention },
    });
    // Apply changes to definitions, entities, and analytics.
    await this.applySettings(updatedSettings);
    return updatedSettings;
  }

  /**
   * Applies the naming convention across definitions, entities, and analytics.
   *
   * This method fetches the current records, transforms them using name conversion functions,
   * and then updates them via helper methods. (Implement renameDefinition, renameEntity,
   * and renameAnalytic in their respective services.)
   */
  private async applySettings(settings: {
    namingConvention: string;
  }): Promise<void> {
    // Fetch current records.
    const definitions = await this.definitionsService.getDefinitions(); // Record keyed by definition name
    const entities = await this.entitiesService.getEntities(); // Record keyed by entity label
    const analytics = await this.analyticsService.getAnalytics(); // Nested map: { [type]: { [name]: number } }

    // Loop through definitions and update their keys if needed.
    for (const originalName of Object.keys(definitions)) {
      let transformedName: string;
      switch (settings.namingConvention) {
        case 'camelCase':
          transformedName = toCamelCase(originalName);
          break;
        case 'PascalCase':
          transformedName = toPascalCase(originalName);
          break;
        case 'kebab-case':
          transformedName = toKebabCase(originalName);
          break;
        case 'snake_case':
        default:
          transformedName = toSnakeCase(originalName);
          break;
      }
      if (transformedName !== originalName) {
        // This helper should update the definition’s primary key (name) in the DB.
        await this.definitionsService.renameDefinition(
          originalName,
          transformedName,
        );
      }
    }

    // Loop through entities and update their labels.
    for (const originalLabel of Object.keys(entities)) {
      let transformedLabel: string;
      switch (settings.namingConvention) {
        case 'camelCase':
          transformedLabel = toCamelCase(originalLabel);
          break;
        case 'PascalCase':
          transformedLabel = toPascalCase(originalLabel);
          break;
        case 'kebab-case':
          transformedLabel = toKebabCase(originalLabel);
          break;
        case 'snake_case':
        default:
          transformedLabel = toSnakeCase(originalLabel);
          break;
      }
      if (transformedLabel !== originalLabel) {
        // This helper should update the entity’s label in the DB.
        await this.entitiesService.renameEntity(
          originalLabel,
          transformedLabel,
        );
      }
    }

    // For analytics of type "definition", update the inner keys.
    const analyticsDefinition = analytics['definition'];
    if (analyticsDefinition) {
      for (const originalName of Object.keys(analyticsDefinition)) {
        let transformedName: string;
        switch (settings.namingConvention) {
          case 'camelCase':
            transformedName = toCamelCase(originalName);
            break;
          case 'PascalCase':
            transformedName = toPascalCase(originalName);
            break;
          case 'kebab-case':
            transformedName = toKebabCase(originalName);
            break;
          case 'snake_case':
          default:
            transformedName = toSnakeCase(originalName);
            break;
        }
        if (transformedName !== originalName) {
          // This helper should update the analytic record where type = 'definition'
          await this.analyticsService.renameAnalytic(
            'definition',
            originalName,
            transformedName,
          );
        }
      }
    }
  }
}
