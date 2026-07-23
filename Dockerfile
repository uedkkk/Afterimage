# Stage 1: Install dependencies (needs build tools for native modules)
FROM node:22-bookworm-slim AS deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ libc6-dev \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

# Stage 2: Build the application
FROM node:22-bookworm-slim AS builder
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ libc6-dev \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:./data/afterimage.db"
RUN mkdir -p data
RUN npx prisma generate
RUN npx prisma migrate deploy
RUN npm run build

# Stage 3: Minimal runtime
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy standalone server output (includes minimal node_modules)
COPY --from=builder /app/.next/standalone ./
# Copy static assets
COPY --from=builder /app/.next/static ./.next/static
# Copy public directory (includes uploads/.gitkeep files)
COPY --from=builder /app/public ./public
# Copy Prisma files for migrations
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
# Copy generated Prisma client
COPY --from=builder /app/lib/generated ./lib/generated
# Copy full node_modules for prisma CLI, tsx, and seeding at runtime
COPY --from=builder /app/node_modules ./node_modules
# Copy entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Create directories for persistent data
RUN mkdir -p /app/data /app/public/uploads/originals /app/public/uploads/thumbnails /app/public/uploads/optimized

EXPOSE 3000

CMD ["./docker-entrypoint.sh"]
