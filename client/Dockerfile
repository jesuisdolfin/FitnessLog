# Use official Node.js image as a base
FROM node:18

# Set the working directory inside the container
WORKDIR /app
# Correct path based on build context
COPY package.json package-lock.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the frontend code
COPY ./client ./

# Expose the port the React app will run on
EXPOSE 3000

# Start the React development server
CMD ["npm", "start", "--host", "0.0.0.0"]

