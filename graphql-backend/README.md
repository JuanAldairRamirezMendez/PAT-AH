# GraphQL Backend (NestJS + Prisma)

Scaffold mínimo para backend GraphQL usando NestJS, Prisma y PostgreSQL.

Pasos rápidos para arrancar (Windows PowerShell):

1. Entrar en la carpeta

```powershell
Set-Location -LiteralPath 'C:\Users\DARIO\INTEGRADOR\integrador\graphql-backend'
```

2. Instalar dependencias

```powershell
npm install
```

3. Configurar `.env` (copiar `.env.example`)

4. Generar Prisma client y migrar

```powershell
npx prisma generate
npx prisma migrate dev --name init
```

5. Ejecutar en dev

```powershell
npm run start:dev
```

O usar Docker Compose:

```powershell
docker compose up -d --build
```
