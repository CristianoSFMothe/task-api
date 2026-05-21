// @ts-check
import eslint from '@eslint/js'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import globals from 'globals'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    // plugins, languageOptions e rules no mesmo bloco —
    // garante que tudo se aplica no mesmo contexto
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // ordenação de imports — agrupa externos, @/ e relativos
      'simple-import-sort/imports': [
        'error',
        {
          groups: [['^@nestjs', '^@?\\w'], ['^@/'], ['^\\.\\.', '^\\.']],
        },
      ],
      'simple-import-sort/exports': 'error',

      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',

      // o endOfLine: auto evita conflito entre Windows e Linux/Mac
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
)
