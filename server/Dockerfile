# Use the official Go image for the backend
FROM golang:1.22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the Go modules files to install dependencies
COPY go.mod go.sum ./

# Install Go dependencies
RUN go mod download

# Copy the Go source code
COPY . .

# Build the Go application
RUN go build -o main .

# Expose the backend port (5000)
EXPOSE 5000

# Start the Go application
CMD ["./main"]
