FROM golang:1.21-alpine

WORKDIR /app

# Install dependencies
RUN apk add --no-cache gcc musl-dev

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN go build -o main cmd/main.go

# Expose port
EXPOSE 8080

# Run the application
CMD ["./main"]