Microservices scaffold for PAT-AH

Structure:
- services/
  - auth-service/
  - users-service/
  - ai-service/
  - rest-service/
  - ingest-service/
  - shared/prisma/

Notes:
- The Prisma schema was copied from `graphql-backend/prisma/schema.prisma` to `services/shared/prisma/schema.prisma`.
- Each service contains a minimal `package.json` and a `src/main.ts` bootstrap that imports the corresponding module from `graphql-backend/src`.
- This is a non-destructive scaffold. Original code remains in `graphql-backend/` and `microservicios/`.

Next steps:
- Install dependencies per service (`npm install`) or run a workspace install strategy.
- Generate Prisma client: `npx prisma generate --schema=services/shared/prisma/schema.prisma`.
- Adjust env vars: set `DATABASE_URL`, `UPLOADS_DIR`, `MODELS_DIR`.
- Validate each service by running `npm run dev` in its folder.
