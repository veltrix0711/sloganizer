# Multi-stage build for React app
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Fix permissions for all binaries in .bin (covers vite and others)
RUN chmod -R +x node_modules/.bin
# Build the app
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our config as the default
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create a startup script to handle dynamic port
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'PORT=${PORT:-80}' >> /start.sh && \
    echo 'sed -i "s/listen 80/listen $PORT/g" /etc/nginx/conf.d/default.conf' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

# Expose port
EXPOSE 80

# Start with our script
CMD ["/start.sh"]