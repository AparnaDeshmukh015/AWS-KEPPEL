# Stage 1: Build the application
FROM node:22-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm cache clean --force && npm install

# Copy the rest of the application
COPY . .

# Build the app (adjust the build command based on your framework)
RUN npm run build  # Outputs to `/app/build` (React) or `/app/dist` (Vue/Angular)

# ------------------------------------------
# Stage 2: Production server with Nginx
FROM nginx:alpine

# Remove default Nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from the build stage
# ⚠️ Adjust `/app/build` to match your framework's output directory:
# - React: `/app/build`
# - Vue/Angular: `/app/dist`
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom Nginx config (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (HTTP)
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
