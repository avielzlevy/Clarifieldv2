// utils/clipboardUtils.js
import RandExp from 'randexp';
export const determineRegexType = (pattern) => {
  const testValues = {
    integer: ['0', '-1', '42'],
    number: ['3.14', '-2.718', '0', '100', '-50'],
    boolean: ['true', 'false', 'True', 'FALSE', 'TRUE', 'False'],
    string: ['hello', 'world33', '123', 'true'],
  };

  const matchesAll = (values) =>
    values.every((value) => {
      const newRegex = new RegExp(pattern);
      return newRegex.test(value);
    });

  if (matchesAll(testValues.integer)) return 'integer';
  if (matchesAll(testValues.number)) return 'number';
  if (matchesAll(testValues.string)) return 'string';
  if (matchesAll(testValues.boolean)) return 'boolean';
  return 'string';
};

export const generateSampleValue = (field) => {
  const { type, format } = field;
  switch (type.toLowerCase()) {
    case 'string':
      if (format) {
        if (format === 'email') return 'user@example.com';
        // If format looks like a regex (e.g., starts with ^ and ends with $), use RandExp to generate a match.
        if (format.startsWith('^') && format.endsWith('$')) {
          return new RandExp(format).gen();
        }
        return 'sampleString';
      }
      return 'sampleString';
    case 'number':
      return 42;
    case 'boolean':
      return true;
    case 'array':
      return field.items && field.items.type ? [generateSampleValue(field.items)] : [];
    case 'object':
      return field.properties ? generateSampleObject(field.properties) : {};
    case 'entity':
      // If this field is an entity and it contains nested fields, generate a sample object from them.
      return field.fields ? generateSampleObject(field.fields) : {};
    default:
      return null;
  }
};


export const generateSampleObject = (schema) => {
  const sampleObject = {};
  schema.forEach((field) => {
    sampleObject[field.name] = generateSampleValue(field);
  });
  return sampleObject;
};