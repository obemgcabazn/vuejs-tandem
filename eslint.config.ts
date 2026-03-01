import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from 'eslint-config-prettier/flat'

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    name: 'app/strict-types',
    files: ['**/*.{vue,ts,mts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
      'max-lines-per-function': ['warn', { max: 40 }],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.object.name='document'][callee.property.name='querySelector']",
          message: 'Use Vue refs and reactive state instead of document.querySelector',
        },
        {
          selector:
            "CallExpression[callee.object.name='document'][callee.property.name='querySelectorAll']",
          message: 'Use Vue refs and reactive state instead of document.querySelectorAll',
        },
        {
          selector:
            "CallExpression[callee.object.name='document'][callee.property.name='getElementById']",
          message: 'Use Vue refs instead of document.getElementById',
        },
        {
          selector:
            "CallExpression[callee.object.name='document'][callee.property.name='getElementsByClassName']",
          message: 'Use Vue refs and children instead of getElementsByClassName',
        },
        {
          selector:
            "CallExpression[callee.object.name='document'][callee.property.name='getElementsByTagName']",
          message: 'Use Vue refs and children instead of getElementsByTagName',
        },
      ],
    },
  },

  {
    ...pluginVitest.configs.recommended,
    files: ['__tests__/**/*.spec.ts', '__tests__/**/*.spec.tsx'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

  skipFormatting,
)
