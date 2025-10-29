FROM node:18-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package*.json ./
RUN npm install

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
RUN npm prune --omit=dev && npm cache clean --force

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/tailwind.config.mjs ./tailwind.config.mjs
COPY --from=builder /app/postcss.config.mjs ./postcss.config.mjs
COPY --from=builder /app/jsconfig.json ./jsconfig.json
EXPOSE 83
CMD ["npm", "run", "start"]
