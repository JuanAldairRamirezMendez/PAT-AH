# DEPLOY to Render

This document explains how to deploy the microservices in this repository to Render.

Overview
- There are multiple microservices under `Backend-Huancavelica-Alertas-Agricolas/services/`:
  - `auth-service`, `users-service`, `rest-service`, `ai-service`, `ingest-service`.
- Each service has its own `Dockerfile` and expects the shared Prisma schema at `services/shared/prisma/schema.prisma`.
- We provide a `render.yaml` at the repository root to declare services and a migration job in Render.

Recommended approach
1. Use the `render.yaml` in the repository root to create resources in Render (Import repo or Create from render.yaml).
2. Create a Managed Postgres on Render (the `render.yaml` can declare one named `pat-ah-db`) and set `DATABASE_URL` automatically for each service.
3. After services are created, run the `pat-ah-prisma-migrate` job (one-off) from the Render dashboard to apply migrations:

```sh
# from Render dashboard: run job 'pat-ah-prisma-migrate'
# or using renderctl / API if configured
```

If you prefer manual steps in the Render UI
- Create a service per microservice (New -> Web Service) and use these values:
  - Language: Docker
  - Branch: `main`
  - Root Directory: leave empty (use repo root)
  - Dockerfile Path: `Backend-Huancavelica-Alertas-Agricolas/services/<service>/Dockerfile`
  - Instance type: choose Starter/Standard depending on service
  - Environment variables: at minimum `DATABASE_URL`, `NODE_ENV=production`, `JWT_SECRET` (if used)

Local build and push (optional)
- Use the provided script to build all images locally and optionally push to a registry:

PowerShell:
```powershell
# build images locally
.\scripts\build-all.ps1 -tagSuffix "local"

# build and push (after docker login)
.\scripts\build-all.ps1 -tagSuffix "v1.0.0" -registry "docker.io/tu-usuario" -push
```

Notes and troubleshooting
- Dockerfile considerations: our Dockerfiles copy `services/shared/prisma/schema.prisma` during build. If you set `Root Directory` to a service folder in Render UI, adjust Dockerfiles or duplicate the schema into the service folder.
- Prisma migrations: ensure `prisma/migrations` (or your migration files) are present in the repo under `services/shared/prisma/migrations` before running `prisma migrate deploy` in production. If you don't have migrations, use `prisma db push` for a schema push (not recommended for production without review).
- Health checks: Render expects the service to respond on the `$PORT`. Our apps use `process.env.PORT || <default>` so Render `PORT` works. Consider adding a `GET /healthz` that returns 200 for quick checks.

Contact
- If you want, I can commit `render.yaml` and this `DEPLOY.md` and the build script; then you just push and import to Render. If you want me to also create a job or run commands, grant permission to run git in your environment or follow the provided git commands.
