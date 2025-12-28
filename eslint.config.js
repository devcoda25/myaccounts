import js from '@eslint/js'
import react from 'eslint-plugin-react'
import hooks from 'eslint-plugin-react-hooks'
import refresh from 'eslint-plugin-react-refresh'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react,
      'react-hooks': hooks,
      'react-refresh': refresh,
      '@typescript-eslint': tsPlugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...hooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // keep it pragmatic for a large UI codebase
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
]
