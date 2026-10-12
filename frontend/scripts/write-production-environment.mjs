import { writeFile } from 'node:fs/promises';

const required = ['SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY', 'API_BASE_URL'];
const missing = required.filter((name) => !(process.env[name] || '').trim());
if (missing.length) {
  console.error(`Missing production frontend configuration: ${missing.join(', ')}`);
  process.exit(1);
}
for (const key of required) {
  if (process.env[key].includes('YOUR_') || process.env[key].includes('REPLACE_ME')) {
    console.error(`Production configuration ${key} still contains a placeholder.`);
    process.exit(1);
  }
}
const contents = `// Generated at build time. Do not commit this file.\nexport const environment = ${JSON.stringify({
  production: true,
  supabaseUrl: process.env.SUPABASE_URL.replace(/\/$/, ''),
  supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY,
  apiBaseUrl: process.env.API_BASE_URL.replace(/\/$/, '')
}, null, 2)};\n`;
await writeFile(new URL('../src/environments/environment.prod.ts', import.meta.url), contents, 'utf8');
console.log('Generated production Angular environment configuration.');
