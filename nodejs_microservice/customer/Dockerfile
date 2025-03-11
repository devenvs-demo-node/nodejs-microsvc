# Use a lightweight Node.js base image
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app/customer

# Copy only package.json and package-lock.json first (for optimized caching)
COPY package*.json .

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the application port
EXPOSE 8001

# Start the app
CMD ["npm", "start"]


# FROM node:20-alpine

# WORKDIR /app/customer

# COPY package.json .

# RUN npm install

# COPY . .

# EXPOSE 8001

# CMD ["npm", "start"]