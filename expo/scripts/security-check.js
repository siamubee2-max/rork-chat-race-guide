#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const checks = [
  {
    file: 'context/auth.tsx',
    pattern: /EXPO_PUBLIC_DEMO_PASSWORD|Demo1234!/,
    message: 'Public demo credentials must never be referenced from client auth code.',
  },
  {
    file: 'context/auth.tsx',
    pattern: /subscription_tier:\s*tier/,
    message: 'Client auth code must not persist paid subscription tiers directly to Supabase.',
  },
  {
    file: 'backend/hono.ts',
    pattern: /app\.use\("\*",\s*cors\(\)\)/,
    message: 'Wildcard CORS middleware is forbidden on the backend.',
  },
  {
    file: 'backend/trpc/routes/ai.ts',
    pattern: /breedIdentify:\s*publicProcedure/,
    message: 'AI image identification must not be exposed as a public procedure.',
  },
  {
    file: 'backend/trpc/routes/profile.ts',
    pattern: /subscription_tier:\s*z/,
    message: 'Profile update schema must not allow direct subscription tier mutation.',
  },
  {
    file: 'scripts/setup-demo-account.js',
    pattern: /Password\s*:.*DEMO_PASSWORD/,
    message: 'Demo setup script must not print the configured password to logs.',
  },
];

const failures = [];

for (const check of checks) {
  const filePath = path.join(rootDir, check.file);
  const content = fs.readFileSync(filePath, 'utf8');

  if (check.pattern.test(content)) {
    failures.push(`${check.file}: ${check.message}`);
  }
}

if (failures.length > 0) {
  console.error('Security checks failed:\n');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Security checks passed.');