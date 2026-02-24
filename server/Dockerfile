# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Create a non-root user for security
RUN addgroup -S nodeuser && adduser -S nodeuser -G nodeuser
RUN chown -R nodeuser:nodeuser /app
USER nodeuser

EXPOSE 5000

CMD ["npm", "start"]
