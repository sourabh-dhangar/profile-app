# ===================================================
# MyProfile Backend - Production Multi-Stage Dockerfile
# ===================================================

# Stage 1: Dependency resolution & build
FROM node:20-alpine AS deps
WORKDIR /app

# Install build tools if native compilation is needed
RUN apk add --no-cache libc6-compat python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm rebuild sharp

# Stage 2: Production runtime image
FROM node:20-alpine AS runner
WORKDIR /app

# Install curl for container healthcheck
RUN apk add --no-cache curl

ENV NODE_ENV=production
ENV PORT=5000

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY src/ ./src/

# Ensure uploads directories exist with proper write permissions
RUN mkdir -p /app/uploads/photos /app/uploads/reels /app/uploads/qrcodes && \
    chown -R node:node /app

USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["node", "src/server.js"]
