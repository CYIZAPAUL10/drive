import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const noServer = {
  // Blocks everything under @/server EXCEPT @/server/actions
  regex: '^@/server(/(?!actions(/|$)).*)?$',
  message: 'Frontend code must not import from /server. (Server Actions in /server/actions are the one allowed exception.)',
};
const noAdminUi = {
  group: ['@/frontend/**/admin', '@/frontend/**/admin/**'],
  message: 'Public pages must not import admin UI code.',
};
const noFrontend = {
  group: ['@/frontend', '@/frontend/**'],
  message: 'Server and shared code must not import from /frontend.',
};
const noServerFromShared = {
  group: ['@/server', '@/server/**'],
  message: '/shared must stay environment-neutral: no imports from /server.',
};

const restrict = (...patterns) => ({
  'no-restricted-imports': ['error', { patterns }],
});

export default defineConfig([
  ...nextVitals,
  ...nextTs,
globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'src/generated/**', 'playwright-report/**', 'test-results/**']),


  // Public frontend: no /server (except actions) and no admin UI
  {
    files: ['src/frontend/**/*.{ts,tsx}'],
    ignores: ['src/frontend/**/admin/**'],
    rules: restrict(noServer, noAdminUi),
  },
  // Admin frontend: no /server (except actions)
  {
    files: ['src/frontend/**/admin/**/*.{ts,tsx}'],
    rules: restrict(noServer),
  },
  // Backend: never imports UI code
  {
    files: ['src/server/**/*.{ts,tsx}'],
    rules: restrict(noFrontend),
  },
  // Shared: neither side
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: restrict(noFrontend, noServerFromShared),
  },
]);