import '../lib/env.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const here = path.dirname(fileURLToPath(import.meta.url));

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(here, '..', '..', 'data');

const DB_FILE = process.env.DB_FILE
  ? path.resolve(process.env.DB_FILE)
  : path.join(DATA_DIR, 'portfolio.db');

fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });

export const db = new DatabaseSync(DB_FILE);

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');
db.exec(fs.readFileSync(path.join(here, 'schema.sql'), 'utf8'));

const PLAN_CATALOG = [
  ['free', 'Starter', 0, 1, 6, 0, 0, 'violet'],
  ['pro', 'Professional', 19, 5, 40, 1, 1, 'cyan'],
  ['studio', 'Studio', 49, 25, 200, 1, 1, 'amber'],
];

const insertPlan = db.prepare(
  `INSERT OR IGNORE INTO plans
     (code, name, price_monthly, max_portfolios, max_projects, analytics, custom_domain, accent)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
);
for (const plan of PLAN_CATALOG) insertPlan.run(...plan);

export const dbFile = DB_FILE;

/** Run a query and return every row. */
export function all(sql, ...params) {
  return db.prepare(sql).all(...params);
}

/** Run a query and return the first row (or null). */
export function get(sql, ...params) {
  return db.prepare(sql).get(...params) ?? null;
}

/** Execute a write statement; returns { changes, lastInsertRowid }. */
export function run(sql, ...params) {
  return db.prepare(sql).run(...params);
}

/** Execute `fn` inside a transaction, rolling back on any throw. */
export function transaction(fn) {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export default db;
