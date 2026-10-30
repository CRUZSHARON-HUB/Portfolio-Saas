import fs from 'node:fs';
import { dbFile } from './index.js';

for (const suffix of ['', '-wal', '-shm']) {
  const file = `${dbFile}${suffix}`;
  if (fs.existsSync(file)) fs.rmSync(file);
}

console.log(`Database reset — removed ${dbFile}`);
console.log('Run `npm run seed` to restore the demo account.');
