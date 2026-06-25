# syntax=docker/dockerfile:1

FROM oven/bun:1.3.9-alpine AS build
WORKDIR /app/backend

COPY backend/package.json backend/bun.lock ./
RUN bun install --frozen-lockfile

COPY backend/ ./
RUN bun run build

FROM node:22-alpine AS run
LABEL org.opencontainers.image.source=https://github.com/crozzbite/DnDApp
WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/node_modules ./node_modules
COPY --from=build /app/backend/package.json ./package.json

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/ready').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]

CMD ["node", "dist/main.js"]