FROM node:18-alpine AS base

# ── Install dependencies ──
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── Build ──
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Public env vars baked into the Next.js bundle at build time
ENV NEXT_PUBLIC_API_URL=https://api.tok-ai.cl
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsudG9rLWFpLmNsJA

ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN npm run build

# ── Production runner ──
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
