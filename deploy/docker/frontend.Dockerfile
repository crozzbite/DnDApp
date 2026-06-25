# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

FROM node:22-alpine AS run
LABEL org.opencontainers.image.source=https://github.com/crozzbite/DnDApp
WORKDIR /app/frontend

ENV NODE_ENV=production
ENV PORT=4000

COPY --from=build /app/frontend/dist ./dist

EXPOSE 4000

CMD ["node", "dist/dn-dapp/server/server.mjs"]