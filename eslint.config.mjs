import base from '@jeevansetu/config/eslint/base';

/**
 * Root ESLint config. Individual apps/packages extend the shared presets
 * from @jeevansetu/config. This root config covers loose root-level scripts.
 * @type {import('eslint').Linter.Config[]}
 */
export default [
  {
    ignores: ['apps/**', 'packages/**', '**/dist/**', '**/.next/**', '**/node_modules/**'],
  },
  ...base,
];
