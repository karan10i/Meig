# Meig Blog Application - Docker Setup

This project uses Docker and Docker Compose to run both the Node.js and Flask services.

## Prerequisites

- Docker
- Docker Compose

## Getting Started

### 1. Create a `.env` file (if not exists)
Make sure your `.env` file has all required variables:
```
MONGODB_URI=__
AUTH0_SECRET=your_secret
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_ISSUER_BASE_URL=your_issuer_url
BASE_URL=http://localhost:3000
TINYMCE_API_KEY=your_api_key
```

### 2. Build and Run Services
```sh
# Build images and start services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 3. Access the Application
- Node.js/Express: http://localhost:3000
- Flask: http://localhost:5001

### 4. View Logs
```sh
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f node
docker-compose logs -f flask
```

### 5. Stop Services
```sh
docker-compose down
```

## Useful Commands

```sh
# Rebuild images
docker-compose build

# Restart services
docker-compose restart

# Run a command in a service
docker-compose exec node npm test
docker-compose exec flask python -c "..."

# Remove all containers and volumes
docker-compose down -v
```

## Development

Hot reload is enabled via volume mounts. Changes to files will be automatically reflected without rebuilding.

## Production Deployment

For production, consider:
- Using a multi-stage build
- Setting `FLASK_ENV=production` and `NODE_ENV=production`
- Using environment-specific `.env` files
- Adding health checks
- Using a proper WSGI server for Flask (gunicorn)
