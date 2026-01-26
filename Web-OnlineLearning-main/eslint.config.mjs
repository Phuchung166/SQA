import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  // Custom rule overrides to reduce build-time lint noise. Adjust as needed.
  {
    rules: {
      // Allow `any` in many places (use sparingly) to avoid TS lint failures during build
      '@typescript-eslint/no-explicit-any': 'off',
      // Allow unused variables starting with underscore, and don't fail build on others
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // React key warnings: warn instead of error
      'react/jsx-key': 'warn',
      // Next.js suggests using <Image /> but we may keep <img> in places; lower to warn
      '@next/next/no-img-element': 'warn',
      // Optional: Turn off rule requiring exhaustive deps for hooks (careful)
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];

export default eslintConfig;
