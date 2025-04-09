export const toWords = (str: string): string[] => {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z0-9])/g, '$1 $2')
    .replace(/[_\-\s]+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => word.toLowerCase());
};

export const toSnakeCase = (str: string): string => toWords(str).join('_');

export const toCamelCase = (str: string): string => {
  const words = toWords(str);
  return words
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join('');
};

export const toPascalCase = (str: string): string =>
  toWords(str)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

export const toKebabCase = (str: string): string => toWords(str).join('-');

/**
 * Transforms object keys using the provided transformation function.
 * Uses unknown as the base type to avoid unsafe assignments.
 */
export const transformKeys = (
  obj: unknown,
  transformFunction: (str: string) => string,
): unknown => {
  if (obj !== null && typeof obj === 'object') {
    const newObj: Record<string, unknown> = {};
    const record = obj as Record<string, unknown>;
    for (const key in record) {
      const newKey = transformFunction(key);
      newObj[newKey] = record[key];
    }
    return newObj;
  }
  return obj;
};

/**
 * Recursively transforms keys in an object or array.
 * Uses unknown and explicit type assertions for safe property access.
 */
export const transformEntityKeys = (
  obj: unknown,
  transformFunction: (str: string) => string,
  isRoot: boolean = true,
): unknown => {
  if (Array.isArray(obj)) {
    return obj.map((item) =>
      transformEntityKeys(item, transformFunction, false),
    );
  } else if (obj !== null && typeof obj === 'object') {
    const newObj: Record<string, unknown> = {};
    const record = obj as Record<string, unknown>;
    for (const key in record) {
      if (Object.prototype.hasOwnProperty.call(record, key)) {
        // At the root level, transform the key name.
        const newKey = isRoot ? transformFunction(key) : key;
        if (key === 'label' && typeof record[key] === 'string') {
          newObj[newKey] = transformFunction(record[key]);
        } else {
          newObj[newKey] = transformEntityKeys(
            record[key],
            transformFunction,
            false,
          );
        }
      }
    }
    return newObj;
  }
  return obj;
};
