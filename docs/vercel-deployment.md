# Vercel deployment

AURELIS uses two runtimes. Vercel hosts `apps/web`; a separate persistent service runs `apps/worker`, Chromium, Lighthouse, and the Nu HTML Checker. The web deployment deliberately refuses to create queued work until that worker's authenticated health endpoint is ready.

## Vercel web environment

Configure these values for Production and every Preview environment that should be usable:

- `DATABASE_URL`: a pooled PostgreSQL connection string reachable from Vercel. Production no longer falls back to localhost.
- `APP_URL`: the canonical HTTPS origin for the deployment.
- `APP_ACCESS_USERNAME`: the Basic Auth username; defaults to `aurelis`.
- `APP_ACCESS_PASSWORD`: a random value of at least 16 characters. If it is absent or too short, production returns `503` instead of exposing the application.
- `WORKER_HEALTH_URL`: the HTTPS origin of the persistent worker service.
- `WORKER_HEALTH_TOKEN`: a random value of at least 16 characters, shared only with the worker.
- `OPENAI_API_KEY` and the model variables when AI evaluation is enabled.

Run `pnpm db:migrate:deploy` against the production database before serving traffic. Never use `AURELIS_ALLOW_INSECURE_LOCAL` on a hosted deployment; Vercel ignores that local-only bypass.

## Persistent worker service

`Dockerfile.worker` is the production worker image. It pins the browser image to the same Playwright version as the application, generates the Prisma client during the image build, runs as the non-root `pwuser`, and exposes an authenticated container health check on port `8080`.

On a Docker Compose host, run the worker together with the Nu HTML Checker sidecar:

```bash
docker compose --env-file .env -f docker-compose.worker.yml up -d --build
```

On Railway, Render, Fly.io, or another container platform, deploy `Dockerfile.worker` as a persistent service and provide a separate `ghcr.io/validator/validator:latest` service reachable through `VNU_URL`. The worker start command inside the image is:

```bash
pnpm --filter @aurelis/worker start
```

Configure:

- the same `DATABASE_URL` used by the web deployment;
- the same `WORKER_HEALTH_TOKEN` used by Vercel;
- `PORT`, supplied by the hosting service or `8080` by default;
- `VNU_URL`, pointing to a reachable Nu HTML Checker service;
- the OpenAI model variables used by evaluation.

`GET /health` requires `Authorization: Bearer <WORKER_HEALTH_TOKEN>` and returns `200 {"status":"ready"}` only when the worker can query PostgreSQL. If the worker is stopped, misconfigured, or unreachable, new evaluation and experiment requests return `503 WORKER_UNAVAILABLE` without writing queue records.

## Railway topology

Use one Railway project in a region close to the Vercel deployment, with these three services:

1. A Railway PostgreSQL database. Keep its private `DATABASE_URL` for the worker and use its public connection URL only for Vercel.
2. A Docker Image service named `validator` using `ghcr.io/validator/validator:latest`. It does not need a public domain.
3. A GitHub service named `worker` using this repository and `Dockerfile.worker`. Set `RAILWAY_DOCKERFILE_PATH=Dockerfile.worker`, generate a public domain, and leave Railway's unauthenticated HTTP health-check path unset because `/health` requires a bearer token.

Set these worker variables in Railway:

```text
DATABASE_URL=${{Postgres.DATABASE_URL}}
VNU_URL=http://validator.railway.internal:8888
WORKER_HEALTH_TOKEN=<shared random secret>
OPENAI_API_KEY=<rotated key>
RAILWAY_DOCKERFILE_PATH=Dockerfile.worker
RAILWAY_SHM_SIZE_BYTES=1073741824
```

The exact PostgreSQL service name controls the `${{Postgres.DATABASE_URL}}` reference. If Railway names it differently, use the reference-variable picker rather than copying credentials. `RAILWAY_SHM_SIZE_BYTES` gives Chromium a 1 GiB shared-memory area.

After deployment, use `https://<worker-domain>/health` as Vercel's `WORKER_HEALTH_URL`. Configure the same `WORKER_HEALTH_TOKEN` in both services, run `pnpm db:migrate:deploy` once against the Railway database, and then redeploy the Vercel production deployment.

## Access verification

An unauthenticated page request must return `401` with `WWW-Authenticate: Basic`. An authenticated cross-origin mutation must return `403`. A production deployment with a missing access password must return `503`. These are fail-closed states, not application errors to bypass.
