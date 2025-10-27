FROM node:18-alpine

# Install build dependencies and OpenSSL for Prisma
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy package files and prisma schema early so we can generate the client
COPY package.json package-lock.json* ./
COPY prisma ./prisma

# Install all dependencies (including dev) to allow prisma generate during build
RUN npm ci --legacy-peer-deps

# Generate Prisma client for linux-musl (binaryTargets set in schema)
RUN npx prisma generate

# Copy rest of source and build
COPY . .
RUN npm run build || true

EXPOSE 4000
CMD ["node","dist/main.js"]
