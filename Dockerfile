# Multi-stage build for the monorepo

# Stage 1: Build the chat widget
FROM node:18-alpine AS widget-builder
WORKDIR /app
COPY chat-widget/package*.json chat-widget/pnpm-lock.yaml ./chat-widget/
RUN npm install -g pnpm
WORKDIR /app/chat-widget
RUN pnpm install --frozen-lockfile
COPY chat-widget/ .
RUN pnpm run build

# Stage 2: Build the bot backend
FROM node:18-alpine AS bot-builder
WORKDIR /app
COPY bot/package*.json bot/pnpm-lock.yaml ./bot/
RUN npm install -g pnpm
WORKDIR /app/bot
RUN pnpm install --frozen-lockfile --production

# Stage 3: Production image
FROM node:18-alpine AS production
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy bot dependencies and source
COPY --from=bot-builder /app/bot/node_modules ./bot/node_modules
COPY bot/ ./bot/

# Copy built widget
COPY --from=widget-builder /app/chat-widget/.next ./chat-widget/.next
COPY --from=widget-builder /app/chat-widget/public ./chat-widget/public
COPY --from=widget-builder /app/chat-widget/package.json ./chat-widget/
COPY --from=widget-builder /app/chat-widget/next.config.mjs ./chat-widget/

# Install widget dependencies for production
WORKDIR /app/chat-widget
RUN pnpm install --frozen-lockfile --production

# Go back to root
WORKDIR /app

# Create a startup script
RUN echo '#!/bin/sh\n\
cd /app/bot && pnpm start &\n\
cd /app/chat-widget && pnpm start &\n\
wait' > /app/start.sh && chmod +x /app/start.sh

# Expose ports
EXPOSE 3000 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Start both services
CMD ["/app/start.sh"]
