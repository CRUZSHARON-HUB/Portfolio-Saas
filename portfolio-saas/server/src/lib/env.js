import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';

const here = path.dirname(fileURLToPath(import.meta.url));
const envFile = path.resolve(here, '..', '..', '.env');

if (fs.existsSync(envFile)) {
  const parsed = parseEnv(fs.readFileSync(envFile, 'utf8'));
  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }
}
