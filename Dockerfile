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

# Declare build arguments and set env variables
ARG VITE_API_URL
ARG VITE_SUPABASE_API_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SUPABASE_API_KEY=$VITE_SUPABASE_API_KEY

RUN pnpm build

# Stage 2: Serve stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
