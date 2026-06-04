# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependencies manifest
COPY package.json pnpm-lock.yaml* .npmrc* ./

# Install dependencies
RUN pnpm i --frozen-lockfile

# Copy codebase and build app
COPY . .
RUN pnpm build

# Stage 2: Serve stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
