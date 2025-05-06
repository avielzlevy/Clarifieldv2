// src/entities/entities.types.ts
export interface Field {
  label: string;
  type: 'definition' | 'entity';
}

export interface EntityData {
  fields: Field[];
}
