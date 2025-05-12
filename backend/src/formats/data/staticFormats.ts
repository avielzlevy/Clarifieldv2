const staticFormats = {
  // Original Formats
  Date: {
    pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$',
    description: 'Date in the format YYYY-MM-DD (ISO 8601).',
  },
  Time: {
    pattern: '^(0\\d|1\\d|2[0-3]):([0-5]\\d):([0-5]\\d)$',
    description: 'Time in the format HH:mm:ss (ISO 8601).',
  },
  'Date & Time': {
    pattern:
      '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])[T ](0\\d|1\\d|2[0-3]):([0-5]\\d):([0-5]\\d)(\\.\\d+)?(Z|[+-](0\\d|1[0-2]):([0-5]\\d))?$',
    description:
      'Date & Time in ISO 8601 format (e.g., YYYY-MM-DDTHH:mm:ssZ, YYYY-MM-DDTHH:mm:ss.sss+01:00). Allows T or space separator, optional milliseconds and timezone offset.',
  },
  Email: {
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    description: 'Standard email address format.',
  },
  'Phone Number': {
    // Keeping original for backward compatibility if used, but E164 is preferred
    pattern: '^\\d{2,4}-\\d{4,8}$',
    description:
      'Basic phone number format (e.g., XX-XXXX). For international, see PhoneNumberE164.',
  },
  'ZIP Code': {
    // US-centric
    pattern: '^[0-9]{5}(?:-[0-9]{4})?$',
    description:
      'US ZIP Code format (5 digits or 5+4 digits). For general postal codes, use PostalCodeString.',
  },
  'Credit Card Number': {
    pattern: '^[0-9]{4}-?[0-9]{4}-?[0-9]{4}-?[0-9]{4}$',
    description: 'Credit Card Number, potentially with hyphens.',
  },
  'IPv4 Address': {
    pattern:
      '^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d)$',
    description: 'IPv4 Address in dot-decimal notation.',
  },
  'IPv6 Address': {
    pattern:
      '^((?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?:(?::[0-9a-fA-F]{1,4}){1,6})|:(?:(?::[0-9a-fA-F]{1,4}){1,7}|:))$',
    description: 'IPv6 Address, supporting various shorthand notations.',
  },
  URL: {
    pattern:
      '^(?:[a-zA-Z][a-zA-Z0-9+.-]*):\\/\\/(?:[^\\s/?#]+@)?([^\\s/?#:]+)(?::\\d+)?([^\\s?#]*)(?:\\?[^\\s#]*)?(?:#.*)?$',
    description:
      'URL with a valid protocol scheme, supporting common URL structures.',
  },
  Slug: {
    pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
    description:
      'A slug: lowercase alphanumeric characters and hyphens, not starting or ending with a hyphen.',
  },
  UUID: {
    // This is a generic UUID, v1-v5 is more specific if needed.
    pattern:
      '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
    description: 'Universally Unique Identifier (UUID) general format.',
  },
  UUIDv4: {
    pattern:
      '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$',
    description: 'UUID version 4.',
  },
  Hexadecimal: {
    pattern: '^[0-9a-fA-F]+$',
    description:
      'String containing only hexadecimal characters (0-9, a-f, A-F).',
  },
  Base64: {
    pattern:
      '^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}(?:==)?|[A-Za-z0-9+/]{3}=?)?$',
    description: 'Base64 encoded string, with optional padding.',
  },
  JWT: {
    pattern: '^[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]*$', // Made signature optional as it can be unsecured
    description: 'JSON Web Token (JWT) format.',
  },
  Text: {
    pattern: '^.*$',
    description:
      'Any sequence of characters (can be multi-line if regex engine supports dotall or equivalent).',
  },

  // New Enterprise-Specific Formats
  ETagOrVersionString: {
    pattern:
      '^(W\\/)?"[^"]+"|^v?(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:[-+A-Za-z0-9.]+)?$',
    description:
      'ETag (e.g., W/"abc" or "abc") or a Semantic Version-like string (e.g., v1.2.3, 1.0.0-alpha+001).',
  },
  PrintableAsciiExtended: {
    pattern: '^[ -~]+$',
    description:
      'Any string consisting of printable ASCII characters (space to tilde). Good for generic tokens, some hashes.',
  },
  PermissionString: {
    pattern: '^[a-zA-Z0-9_]+(:[a-zA-Z0-9_]+)*$',
    description:
      "Permission string, typically in 'resource:action' or 'namespace:resource:action' format, using alphanumeric, underscore, and colon.",
  },
  PhoneNumberE164: {
    pattern: '^\\+[1-9]\\d{1,14}$',
    description:
      'Phone number in E.164 international format (e.g., +14155552671).',
  },
  ISO3166Alpha2: {
    pattern: '^[A-Z]{2}$',
    description: 'Two-letter country code (ISO 3166-1 alpha-2).',
  },
  ISO3166Alpha3: {
    pattern: '^[A-Z]{3}$',
    description: 'Three-letter country code (ISO 3166-1 alpha-3).',
  },
  LatitudeString: {
    pattern: '^-?([1-8]?\\d(\\.\\d+)?|90(\\.0+)?)$',
    description: 'Geographic latitude as a string (-90 to 90).',
  },
  LongitudeString: {
    pattern: '^-?((1[0-7]|[1-9])?\\d(\\.\\d+)?|180(\\.0+)?)$',
    description: 'Geographic longitude as a string (-180 to 180).',
  },
  UnixTimestampString: {
    // More generic for seconds or milliseconds
    pattern: '^[0-9]{10,16}$',
    description:
      'Unix timestamp, typically in seconds (10 digits) or milliseconds (13+ digits) since epoch, as a string of digits.',
  },
  BooleanString: {
    pattern: '^(true|false|TRUE|FALSE|0|1)$',
    description:
      'String representation of a boolean (true, false, TRUE, FALSE, 0, or 1).',
  },
  ISO4217CurrencyCode: {
    pattern: '^[A-Z]{3}$',
    description: 'Three-letter currency code (ISO 4217).',
  },
  DecimalString: {
    pattern: '^-?\\d+(\\.\\d{1,4})?$',
    description:
      'Numeric value represented as a string, optionally signed, with 1 to 4 decimal places.',
  },
  PercentageString: {
    pattern: '^(\\d{1,2}(\\.\\d{1,2})?|100(?:\\.0{1,2})?)$',
    description:
      'Percentage value as a string (0-100, up to two decimal places).',
  },
  SKUString: {
    pattern: '^[a-zA-Z0-9_./-]+$',
    description:
      'Stock Keeping Unit (SKU) string, typically alphanumeric with hyphens, underscores, periods, or slashes.',
  },
  PositiveIntegerString: {
    pattern: '^[1-9][0-9]*$',
    description: 'Positive integer value (1 or greater) as a string.',
  },
  ZeroOrPositiveIntegerString: {
    pattern: '^[0-9]+$',
    description: 'Integer value (0 or greater) as a string.',
  },
  CommaSeparatedTagString: {
    pattern: '^[a-zA-Z0-9_-]+(?:,[a-zA-Z0-9_-]+)*$',
    description:
      'A comma-separated list of tags, where each tag is alphanumeric with underscores or hyphens. Allows single tag without comma.',
  },
  LocaleCodeBCP47: {
    pattern: '^[a-z]{2,3}(-[A-Z]{2,3}(-[A-Za-z0-9]+)*)?(?:-[a-zA-Z0-9]{1,8})*$', // More BCP47 compliant
    description:
      'Locale code string (e.g., en, en-US, es-419, zh-Hans-CN) generally following BCP 47.',
  },
  IANATimezoneString: {
    pattern: '^[A-Za-z_]+\\/[A-Za-z0-9_+\\-\\/]+$',
    description:
      'IANA Time Zone Database name (e.g., America/New_York, Etc/UTC, Europe/Paris).',
  },
  AlphanumericExtended: {
    pattern: '^[a-zA-Z0-9_.-]+$',
    description:
      'String containing alphanumeric characters, underscores, periods, and hyphens.',
  },
  PasswordHashString: {
    // Example for a common hash format (e.g. bcrypt)
    pattern: '^\\$2[aby]\\$[0-9]{2}\\$[./A-Za-z0-9]{53}$',
    description:
      'Password hash string, specifically for bcrypt. Other hash types would need different patterns.',
  },
  PostalCodeString: {
    pattern: '^[a-zA-Z0-9\\s-]{3,10}$',
    description:
      'Generic postal code string, allowing letters, numbers, spaces, and hyphens.',
  },
};

export default staticFormats;
