# Infrastructure & Deployment Specification

## Containerization
The application is containerized using Docker to ensure consistency across environments.

### 1. Docker Compose (Development)
The `docker-compose.yml` file defines the following services:
- **db**: PostgreSQL instance with persistent volume storage.
- **backend**: Quarkus application running in JVM or Native mode.
- **frontend**: Vite/React application served via a development server or Nginx.
- **caddy**: Reverse proxy for SSL and routing.

### 2. Network Layout
- All services communicate over an internal Docker network.
- `caddy` exposes ports 80/443 to the host and routes traffic to `frontend` and `backend`.

## Reverse Proxy (Caddy)
Uses a `Caddyfile` for configuration:
- Static file serving for the frontend build.
- Proxying `/api/*` requests to the backend service.
- Automatic HTTPS (when used with a valid domain).

## CI/CD Pipeline (Google Cloud)
The `cloudbuild.yaml` file defines a multi-stage pipeline:
1. **Frontend Build**: `npm install` and `npm run build`.
2. **Backend Build**: `./mvnw package` (Quarkus).
3. **Containerization**: Builds Docker images for both services.
4. **Artifact Registry**: Pushes images to Google Cloud Artifact Registry.
5. **Deployment**: Deploys to a GCP VM or Cloud Run (depending on the target configuration).

## Local Development Requirements
- Docker and Docker Compose.
- Java 17+ (for local backend development).
- Node.js 18+ (for local frontend development).
- PostgreSQL (if running without Docker).
