# ---------- Stage 1: Build ----------
FROM node:22-alpine AS builder

WORKDIR /build

# Install dependencies
COPY package*.json ./

RUN npm ci

# Copy source code
COPY . .

# Build (TypeScript → JS)
RUN npm run build


# ---------- Stage 2: Production ----------
FROM node:22-alpine AS runner

WORKDIR /app

# Only install production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built files from builder
COPY --from=builder /build/dist ./dist

# Run app
CMD ["node", "dist/index.js"]