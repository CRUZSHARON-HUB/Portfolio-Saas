# Prismfolio — Professional Portfolio SaaS

A production-shaped SaaS that lets people craft, publish and measure a professional
portfolio site. The frontend is React + CSS with a hand-built 3D UI layer; the backend is
an Express REST API backed by a real relational SQL schema.

```
portfolio-saas/
├── client/          React 18 + Vite frontend (3D UI)
├── server/          Express + SQL API (JWT auth)
├── package.json     convenience scripts
└── README.md
```

---

## 1. Requirements

| Dependency | Version | Why |
|---|---|---|
| Node.js | **22.5+** (24.x recommended) | The backend uses the built-in `node:sqlite` module — no native build step, no compiler needed |
| npm | 10+ | ships with Node |

> `node:sqlite` is what makes this project install cleanly on Windows, macOS and Linux
> without `better-sqlite3` or a C++ toolchain. It is a stable API in Node 24.

---

## 2. Install

```bash
# from the project root
npm run install:all
```

Or manually:

```bash
cd server && npm install
cd ../client && npm install
```

---

## 3. Seed the database

```bash
npm run seed
```

This creates `server/data/portfolio.db`, loads the plan catalogue and inserts a fully
populated demo account:

| | |
|---|---|
| Email | `demo@portfoliosaas.dev` |
| Password | `demo1234` |
| Public page | <http://localhost:4000/p/alex-rivera> |

The demo portfolio ships with 6 projects, 12 skills, 3 roles, 30 days of back-dated
traffic and one contact message, so the analytics screens have real data on first run.

---

## 4. Run it

### Option A — two processes (development, hot reload)

```bash
npm run dev          # starts the API on :4000 and Vite on :5173
```

Open <http://localhost:5173>. Vite proxies `/api` to the Express server.

### Option B — one process (production build)

```bash
npm run build        # bundles the React app into client/dist
npm start            # Express serves the API *and* the built client on :4000
```

Open <http://localhost:4000>.

---

## 5. Configuration

The server reads environment variables directly (see `server/.env.example`). Copy
`server/.env.example` to `server/.env` to override anything — the file is loaded
automatically on startup, and real shell environment variables always win over it.
Everything has a working default, so no setup is required for local use.

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `4000` | API port |
| `JWT_SECRET` | dev fallback | **Change this before deploying** |
| `JWT_EXPIRES_IN` | `7d` | Session lifetime |
| `CORS_ORIGIN` | all origins | Comma-separated allow-list |
| `DATA_DIR` | `server/data` | Where the SQLite file lives |
| `DB_FILE` | `<DATA_DIR>/portfolio.db` | Explicit database path |

The client reads `client/.env` (Vite convention). `VITE_API_PROXY_TARGET` sets the
address the dev server proxies `/api` to; it defaults to `http://localhost:4000`.

---

## 6. The 3D UI layer

Everything 3D is hand-written — no Three.js, no WebGL context, no extra bundle weight.

| Component | Technique |
|---|---|
| `ParticleField.jsx` | Canvas particle system in a real 3D space, rotated by pointer position, projected with a perspective divide, depth-scaled sizing, constellation links between near particles |
| `CubeScene.jsx` | Six-face CSS 3D cube using `transform-style: preserve-3d`, auto-spinning with pointer-driven tilt |
| `TiltCard.jsx` | Cards that rotate on X/Y following the cursor, with inner content pushed forward on Z |
| `DepthStack.jsx` | Layered panels at different `translateZ` depths inside a shared perspective stage |

Supporting primitives live in `client/src/styles/three-d.css`: perspective stages,
glass surfaces with gradient edges, holographic conic borders, orbital rings, levitation
animations and depth-aware button states.

---

## 7. Data model

Seven tables, all with foreign keys and indexes (`server/src/db/schema.sql`):

| Table | Purpose |
|---|---|
| `users` | Accounts, bcrypt password hashes, plan code |
| `plans` | Starter / Professional / Studio catalogue with quotas |
| `portfolios` | The portfolio itself — slug, template, accent, publish flag, view counter |
| `projects` | Case studies with tech stacks, links and a featured flag |
| `skills` | Skill name, category, proficiency level |
| `experiences` | Timeline entries — role, company, dates |
| `views` | One row per public hit: timestamp, referrer, device class |
| `inquiries` | Messages submitted through the public contact form |

Plan quotas (portfolio count, project count) are enforced **server-side** on every write,
so limits hold regardless of what the browser sends.

---

## 8. API

All protected endpoints expect `Authorization: Bearer <token>`.

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create an account (a starter portfolio is created too) |
| `POST` | `/api/auth/login` | Sign in, returns a JWT |
| `GET` | `/api/auth/me` | Current profile + plan |
| `PATCH` | `/api/auth/me` | Update profile |
| `GET` | `/api/auth/plans` | Plan catalogue (public) |

### Portfolios
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/portfolios` | List owned portfolios + plan |
| `POST` | `/api/portfolios` | Create a portfolio |
| `GET` | `/api/portfolios/:id` | Portfolio with projects, skills and roles |
| `PATCH` | `/api/portfolios/:id` | Update details, template, accent, slug |
| `DELETE` | `/api/portfolios/:id` | Delete (cascades) |
| `POST` | `/api/portfolios/:id/publish` | Toggle published state |
| `POST/PATCH/DELETE` | `/api/portfolios/:id/projects[/:projectId]` | Project CRUD |
| `POST/PATCH/DELETE` | `/api/portfolios/:id/skills[/:skillId]` | Skill CRUD |
| `POST/PATCH/DELETE` | `/api/portfolios/:id/experiences[/:experienceId]` | Role CRUD |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics/:id/analytics` | Totals, 30-day curve, referrers, devices |
| `GET` | `/api/analytics/:id/inquiries` | Contact inbox |
| `POST` | `/api/analytics/:id/inquiries/:inquiryId/read` | Mark as read |

### Public
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/public/directory` | Showcase of published portfolios |
| `GET` | `/api/public/:slug` | Public portfolio payload (records a view) |
| `POST` | `/api/public/:slug/contact` | Submit a contact message |

---

## 9. Routes

| Path | Description |
|---|---|
| `/` | Landing page with the 3D hero |
| `/features`, `/pricing`, `/directory` | Marketing and showcase pages |
| `/login`, `/register` | Split-panel auth screens |
| `/app` | Dashboard (protected) |
| `/app/portfolios` | Portfolio library (protected) |
| `/app/portfolio/:id` | Full editor with live preview (protected) |
| `/app/analytics` | Traffic analytics and inbox (protected) |
| `/app/settings` | Profile settings (protected) |
| `/p/:slug` | Published portfolio |

---

## 10. Notes

- Passwords are hashed with bcrypt; sessions are stateless JWTs.
- Every SQL statement uses bound parameters — no string-concatenated queries.
- The database is created and migrated automatically on first boot.
- `npm run reset` wipes the database; `npm run seed` restores the demo data.
