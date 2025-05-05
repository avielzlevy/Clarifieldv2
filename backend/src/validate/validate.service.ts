import { Injectable } from '@nestjs/common';
import { DefinitionsService } from '../definitions/definitions.service';
import { FormatsService } from '../formats/formats.service';
import { EntitiesService } from '../entities/entities.service';
import { EntityData } from '../entities/entities.types';

@Injectable()
export class ValidateService {
  constructor(
    private readonly definitionsService: DefinitionsService,
    private readonly formatsService: FormatsService,
    private readonly entitiesService: EntitiesService,
  ) {}

  /**
   * Validates the provided data recursively against definitions, formats, and entities.
   * Returns an array of error messages for any validation failures.
   */
  async validateData(data: any): Promise<string[]> {
    const [definitions, formats, entities] = await Promise.all([
      this.definitionsService.getDefinitions(),
      this.formatsService.getFormats(),
      this.entitiesService.getEntities(),
    ]);

    const errors: string[] = [];

    if (data && typeof data === 'object') {
      for (const key of Object.keys(data)) {
        this.validateNode(
          key,
          (data as Record<string, unknown>)[key],
          definitions,
          formats,
          entities,
          errors,
        );
      }
    } else {
      errors.push('Root value must be an object');
    }

    return errors;
  }

  private validateNode(
    key: string,
    value: unknown,
    definitions: Record<string, { format: string }>,
    formats: Record<string, { pattern: string }>,
    entities: Record<string, EntityData>,
    errors: string[],
    path: string = '',
  ): void {
    const currentPath = path ? `${path}.${key}` : key;

    // 1) Definition: validate primitive against regex
    if (definitions[key]) {
      const def = definitions[key];
      const fmt = formats[def.format];
      if (!fmt) {
        errors.push(
          `Definition "${currentPath}" references unknown format "${def.format}"`,
        );
        return;
      }
      let strVal: string;
      if (typeof value === 'string') {
        strVal = value;
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        strVal = value.toString();
      } else {
        errors.push(
          `"${currentPath}" should be a primitive matching format "${def.format}"`,
        );
        return;
      }
      if (!new RegExp(fmt.pattern).test(strVal)) {
        errors.push(
          `Invalid value "${strVal}" for "${currentPath}": does not match pattern ${fmt.pattern}`,
        );
      }
      return;
    }

    // 2) Entity: validate object against its fields (allow omissions)
    if (entities[key]) {
      if (value === null || typeof value !== 'object') {
        errors.push(
          `"${currentPath}" should be an object matching entity "${key}"`,
        );
        return;
      }
      const record = value as Record<string, unknown>;
      const entity = entities[key];
      const seen = new Set<string>();

      // Only validate provided fields; omissions allowed
      for (const field of entity.fields) {
        seen.add(field.label);
        if (field.label in record) {
          this.validateNode(
            field.label,
            record[field.label],
            definitions,
            formats,
            entities,
            errors,
            currentPath,
          );
        }
      }

      // Flag any additional (unexpected) properties
      for (const prop of Object.keys(record)) {
        if (!seen.has(prop)) {
          errors.push(`Unexpected field "${prop}" in entity "${currentPath}"`);
        }
      }
      return;
    }

    // 3) Neither definition nor entity
    errors.push(
      `Key "${currentPath}" is not defined as a definition or entity"`,
    );
  }
}
