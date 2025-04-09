import { Injectable } from '@nestjs/common';
import { DefinitionsService } from '../definitions/definitions.service';
import { FormatsService } from '../formats/formats.service';

@Injectable()
export class ValidateService {
  constructor(
    private readonly definitionsService: DefinitionsService,
    private readonly formatsService: FormatsService,
  ) {}

  /**
   * Validates the provided data recursively against the definitions and formats.
   * Returns an array of error messages if any validations fail.
   */
  async validateData(data: any): Promise<string[]> {
    // Retrieve definitions and formats from the database (merged with any static formats in the FormatsService)
    const definitions = await this.definitionsService.getDefinitions();
    const formats = await this.formatsService.getFormats();
    const errors: string[] = [];

    this.validateObject(data, definitions, formats, errors);
    return errors;
  }

  private validateObject(
    obj: unknown,
    definitions: Record<
      string,
      { format: string; description?: string | null }
    >,
    formats: Record<string, { pattern: string; description?: string | null }>,
    errors: string[],
    path: string = '',
  ): void {
    if (obj === null || typeof obj !== 'object') return;
    const record = obj as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      const currentPath = path ? `${path}.${key}` : key;
      if (!(key in definitions)) {
        errors.push(`Key "${currentPath}" is not defined in the policy`);
        continue;
      }

      const definition = definitions[key];
      const format = formats[definition.format];
      if (!format) {
        errors.push(
          `Definition for "${currentPath}" references unknown format "${definition.format}"`,
        );
        continue;
      }

      const value = record[key];
      if (value !== null && typeof value === 'object') {
        this.validateObject(value, definitions, formats, errors, currentPath);
      } else {
        const regex = new RegExp(format.pattern);
        // Convert value explicitly to string to satisfy template literal restrictions.
        if (!regex.test(String(value))) {
          errors.push(
            `Invalid value ${String(value)} for "${currentPath}": does not match the pattern "${format.pattern}"`,
          );
        }
      }
    }
  }
}
