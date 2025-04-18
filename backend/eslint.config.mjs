// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import requireApiProperty from './rules/require-api-property.mjs';
import requireApiOperation from './rules/require-api-operation.mjs';
import requireApiResponse from './rules/require-api-response.mjs';
import matchOptionalProp from './rules/match-optional-with-api-property-optional.mjs';
import requireApiTags from './rules/require-api-tags.mjs';
import requireApiBearerAuth from './rules/require-api-bearer-auth.mjs';
import requireApiParam from './rules/require-api-param.mjs';
import requireApiQuery from './rules/require-api-query.mjs';
import requireApiBody from './rules/require-api-body.mjs';
import requireApiHeader from './rules/require-api-header.mjs';
import requireApiExtraModels from './rules/require-api-extra-models.mjs';






export default tseslint.config(
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
      'custom/require-api-extra-models': 'error',
    },
  },
);