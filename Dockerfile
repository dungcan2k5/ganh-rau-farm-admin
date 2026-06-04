# syntax=docker/dockerfile:1
# check=skip=SecretsUsedInArgOrEnv
# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependencies manifest
COPY package.json pnpm-lock.yaml* .npmrc* ./

# Install dependencies
RUN pnpm i --frozen-lockfile

# Copy codebase
COPY . .

# Declare build arguments
ARG VITE_API_URL
ARG VITE_SUPABASE_API_KEY

# Dynamically write .env file inside the container from build arguments
RUN echo "VITE_API_URL=$VITE_API_URL" > .env && \
    echo "VITE_SUPABASE_API_KEY=$VITE_SUPABASE_API_KEY" >> .env

RUN pnpm build

# Stage 2: Serve stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
