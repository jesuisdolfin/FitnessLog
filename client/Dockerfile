# Use the official Node.js image for the frontend
FROM node:18 AS build

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the React app
RUN npm run build

# Install a simple HTTP server to serve the React build files
RUN npm install -g serve

# Expose port 3000 for the React app
EXPOSE 3000

# Serve the build directory with serve
CMD ["serve", "-s", "build", "-l", "3000"]
