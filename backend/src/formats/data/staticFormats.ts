const staticFormats = {
  Date: {
    pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$',
    description: 'Date in the format YYYY-MM-DD',
  },
  Time: {
    pattern: '^(0\\d|1\\d|2[0-3]):([0-5]\\d):([0-5]\\d)$',
    description: 'Time in the format HH:mm:ss',
  },
  'Date & Time': {
    pattern:
      '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])[ T](0\\d|1\\d|2[0-3]):([0-5]\\d):([0-5]\\d)$',
    description:
      'Date & Time in the format YYYY-MM-DD HH:mm:ss or YYYY-MM-DDTHH:mm:ss',
  },
  Email: {
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    description: 'Email address',
  },
  'Phone Number': {
    pattern: '^\\d{2,4}-\\d{4,8}$',
    description: 'Phone number',
  },
  'ZIP Code': {
    pattern: '^[0-9]{5}(?:-[0-9]{4})?$',
    description: 'ZIP Code',
  },
  'Credit Card Number': {
    pattern: '^[0-9]{4}-?[0-9]{4}-?[0-9]{4}-?[0-9]{4}$',
    description: 'Credit Card Number',
  },
  'IPv4 Address': {
    // Each octet from 0 to 255
    pattern:
      '^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d)$',
    description: 'IPv4 Address',
  },
  'IPv6 Address': {
    // Comprehensive IPv6 regex supporting shorthand
    pattern:
      '^((?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?:(?::[0-9a-fA-F]{1,4}){1,6})|:(?:(?::[0-9a-fA-F]{1,4}){1,7}|:))$',
    description: 'IPv6 Address',
  },
  URL: {
    // Accept any valid scheme (e.g. http, https, ftp, mailto, etc.)
    pattern: '^(?:[a-zA-Z][a-zA-Z0-9+.-]*):\\/\\/[^\\s/$.?#].[^\\s]*$',
    description: 'URL with a valid protocol scheme',
  },
  Slug: {
    pattern: '^[a-z0-9-]+$',
    description:
      'A slug is a string used to identify a resource in a URL. It contains only lowercase letters, numbers, and hyphens.',
  },
  UUID: {
    pattern:
      '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
    description: 'UUID',
  },
  Hexadecimal: {
    pattern: '^[0-9a-fA-F]+$',
    description: 'Hexadecimal number',
  },
  Base64: {
    // Standard Base64 with optional padding "=" signs.
    pattern:
      '^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}(?:==)?|[A-Za-z0-9+/]{3}=?)?$',
    description: 'Base64 encoded string',
  },
  JWT: {
    pattern: '^[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+$',
    description: 'JSON Web Token',
  },
  Text: {
    pattern: '^.*$',
    description: 'Text',
  },
};

export default staticFormats;
