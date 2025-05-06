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
    const updatedSettings = {
      ...currentSettings,
      namingConvention,
    };
    // Apply changes to definitions, entities, and analytics.
    await this.applySettings(updatedSettings);
    const updateSettings = await this.prisma.setting.update({
      where: { id: currentSettings.id },
      data: { namingConvention },
    });
    return updateSettings;
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
    const definitions = await this.definitionsService.getDefinitions();
    const entities = await this.entitiesService.getEntities();
    const analytics = await this.analyticsService.getAnalytics();

    // helper to pick the right converter
    const convert = (name: string) => {
      switch (settings.namingConvention) {
        case 'camelCase':
          return toCamelCase(name);
        case 'PascalCase':
          return toPascalCase(name);
        case 'kebab-case':
          return toKebabCase(name);
        case 'snake_case':
        default:
          return toSnakeCase(name);
      }
    };

    // 1. rename definitions as before…
    for (const origDef of Object.keys(definitions)) {
      const newDef = convert(origDef);
      if (newDef !== origDef) {
        await this.definitionsService.renameDefinition(origDef, newDef);
      }
    }

    // 2. **Entities: first update fields (using original labels)**
    const originalEntityKeys = Object.keys(entities);
    for (const origEntityKey of originalEntityKeys) {
      const entity = entities[origEntityKey];
      const transformedFields = entity.fields.map((field) => {
        if (typeof field.label !== 'string') return field;
        const newLabel = convert(field.label);
        return newLabel === field.label ? field : { ...field, label: newLabel };
      });
      await this.entitiesService.updateEntityFields(
        origEntityKey,
        transformedFields,
      );
    }

    // 3. **Then rename each entity label**
    for (const origEntityKey of originalEntityKeys) {
      const newEntityKey = convert(origEntityKey);
      if (newEntityKey !== origEntityKey) {
        await this.entitiesService.renameEntity(origEntityKey, newEntityKey);
      }
    }

    // 4. analytics renaming as before…
    const defAnalytics = analytics['definition'] || {};
    for (const origName of Object.keys(defAnalytics)) {
      const newName = convert(origName);
      if (newName !== origName) {
        await this.analyticsService.renameAnalytic(
          'definition',
          origName,
          newName,
        );
      }
    }
  }
}
