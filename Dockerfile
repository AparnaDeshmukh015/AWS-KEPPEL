# Stage 1: Build the application
FROM node:22-alpine AS build

# Copy package.json & package-lock.json
COPY package*.json ./
 
# Install dependencies
RUN npm install --legacy-peer-deps
 
# Copy rest of the project
COPY . .
 
# Expose React dev server port
EXPOSE 3000
 
# Start React app
CMD ["npm", "start"]git
 
