// eslint.config.cjs
const eslint = require('@eslint/js');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const globals = require('globals');
const tseslint = require('typescript-eslint');

const requireApiProperty = require('./rules/require-api-property.cjs');
const requireApiOperation = require('./rules/require-api-operation.cjs');
const requireApiResponse = require('./rules/require-api-response.cjs');
const matchOptionalProp = require('./rules/match-optional-with-api-property-optional.cjs');
const requireApiTags = require('./rules/require-api-tags.cjs');
const requireApiBearerAuth = require('./rules/require-api-bearer-auth.cjs');
const requireApiParam = require('./rules/require-api-param.cjs');
const requireApiQuery = require('./rules/require-api-query.cjs');
const requireApiBody = require('./rules/require-api-body.cjs');
const requireApiHeader = require('./rules/require-api-header.cjs');
const requireApiProduces = require('./rules/require-api-produces.cjs');
const requireApiConsumes = require('./rules/require-api-consumes.cjs');
const requireApiExtraModels = require('./rules/require-api-extra-models.cjs');
const path = require('path');


module.exports = tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 5,
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    plugins: {
      custom: {
        rules: {
          'require-api-property': requireApiProperty,
          'match-optional-with-api-property-optional': matchOptionalProp,
          'require-api-operation': requireApiOperation,
          'require-api-response': requireApiResponse,
          'require-api-tags': requireApiTags,
          'require-api-bearer-auth': requireApiBearerAuth,
          'require-api-param': requireApiParam,
          'require-api-query': requireApiQuery,
          'require-api-body': requireApiBody,
          'require-api-header': requireApiHeader,
          'require-api-consumes': requireApiConsumes,
          'require-api-produces': requireApiProduces,
          'require-api-extra-models': requireApiExtraModels,
        },
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'custom/require-api-property': 'error',
      'custom/match-optional-with-api-property-optional': 'error',
      'custom/require-api-operation': 'error',
      'custom/require-api-response': 'error',
      'custom/require-api-tags': 'error',
      'custom/require-api-bearer-auth': 'error',
      'custom/require-api-param': 'error',
      'custom/require-api-query': 'error',
      'custom/require-api-body': 'error',
      'custom/require-api-header': 'error',
      'custom/require-api-consumes': 'error',
      'custom/require-api-produces': 'error',
      'custom/require-api-extra-models': 'error',
    },
  },
);