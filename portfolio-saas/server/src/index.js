import './lib/env.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';

import { dbFile } from './db/index.js';
import authRoutes from './routes/auth.js';
import portfolioRoutes from './routes/portfolios.js';
import analyticsRoutes from './routes/analytics.js';
import publicRoutes from './routes/public.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 4000;
const CLIENT_DIST = path.resolve(here, '..', '..', 'client', 'dist');

const app = express();

app.disable('x-powered-by');
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'portfolio-saas-api', database: path.basename(dbFile) });
});

app.use('/api/auth', authRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/public', publicRoutes);

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Serve the built React client when it exists (single-port production mode).
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

// eslint-disable-next-line no-unused-vars
app.use((error, _req, res, _next) => {
  console.error('[api error]', error);
  const status = error.status || 500;
  res.status(status).json({ error: status === 500 ? 'Something went wrong' : error.message });
});

app.listen(PORT, () => {
  console.log(`\n  Portfolio SaaS API  →  http://localhost:${PORT}/api`);
  console.log(`  Database            →  ${dbFile}`);
  if (fs.existsSync(CLIENT_DIST)) {
    console.log(`  Client              →  http://localhost:${PORT}\n`);
  } else {
    console.log(`  Client dev server   →  http://localhost:5173\n`);
  }
});
