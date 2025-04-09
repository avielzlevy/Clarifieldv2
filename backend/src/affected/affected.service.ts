import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DefinitionsService } from '../definitions/definitions.service';
import { EntitiesService } from '../entities/entities.service';

type UsagesMap = Record<string, string[]>;

@Injectable()
export class AffectedService {
  constructor(
    private readonly definitionsService: DefinitionsService,
    private readonly entitiesService: EntitiesService,
  ) {}

  /**
   * Compute usages based on exactly one of format, definition, or entity.
   */
  async getAffected(params: {
    format?: string;
    definition?: string;
    entity?: string;
  }): Promise<UsagesMap> {
    const { format, definition, entity } = params;
    const provided = [format, definition, entity].filter(
      (v) => v !== undefined,
    );
    if (provided.length !== 1) {
      throw new BadRequestException(
        'Please provide exactly one query parameter: format, definition, or entity.',
      );
    }

    // Determine initial reference and search chain
    let initial = format ?? definition ?? entity!;
    initial = decodeURIComponent(initial);
    const usages: UsagesMap = {};

    // 1) If format → find definitions that use it
    if (format) {
      const defs = await this.definitionsService.getDefinitions();
      const matchedDefs = Object.entries(defs)
        .filter(([, d]) => d.format === initial)
        .map(([name]) => name);
      if (matchedDefs.length) {
        usages['definitions'] = matchedDefs;
      }
      // Next: definitions → entities
      const ents = await this.entitiesService.getEntities();
      const matchedEnts: string[] = [];
      for (const defName of matchedDefs) {
        for (const [entityName, ent] of Object.entries(ents)) {
          if (ent.fields.some((f) => f.label === defName)) {
            matchedEnts.push(entityName);
          }
        }
      }
      if (matchedEnts.length) {
        usages['entities'] = Array.from(new Set(matchedEnts));
      }
    }
    // 2) If definition → find entities that use it
    else if (definition) {
      const ents = await this.entitiesService.getEntities();
      const matchedEnts = Object.entries(ents)
        .filter(([, ent]) => ent.fields.some((f) => f.label === initial))
        .map(([name]) => name);
      if (matchedEnts.length) {
        usages['entities'] = matchedEnts;
      }
    }
    // 3) If entity → find entities that use it (including itself)
    else {
      const ents = await this.entitiesService.getEntities();
      const matchedEnts = Object.entries(ents)
        .filter(
          ([name, ent]) =>
            name === initial || ent.fields.some((f) => f.label === initial),
        )
        .map(([name]) => name);
      if (matchedEnts.length) {
        usages['entities'] = matchedEnts;
      }
    }

    if (Object.keys(usages).length === 0) {
      throw new NotFoundException(`No usages found for '${initial}'`);
    }
    return usages;
  }
}
