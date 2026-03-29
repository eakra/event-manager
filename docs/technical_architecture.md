# Technical Architecture Overview

## Technology Stack
- **Frontend**: React.js with TypeScript, Material UI (MUI) for styling and components.
- **Backend**: Java Quarkus (RESTful API), Hibernate ORM with Panache.
- **Database**: PostgreSQL.
- **Authentication**: JWT (JSON Web Tokens) with Role-Based Access Control (RBAC).
- **Email**: Quarkus Mailer (SMTP).
- **Deployment**: Docker-compose for local development, Google Cloud Build / Artifact Registry for production.

## System Components

### 1. Frontend Web App
- Single Page Application (SPA) built with React.
- React Router for client-side navigation.
- Context API for state management (Auth Context).
- Responsive design for Admin, Staff, and Participant dashboards.

### 2. Backend REST API
- Quarkus framework providing high-performance, container-native Java.
- **Resources (Controllers)**: JAX-RS endpoints for all CRUD and business logic.
- **Entities**: JPA entities mapping to the PostgreSQL schema.
- **Assignment Engine**: Service responsible for evaluating staff availability and qualifications for specific events.
- **Security**: SmallRye JWT for handling token validation and @RolesAllowed annotations.

### 3. Database
- Relational schema managed via Flyway migrations.
- Handles many-to-many relationships for tags and assignments.

### 4. Assignment Engine Logic
The core business logic resides in a dedicated service that evaluates staff suitability for an event based on:
1. **Qualifications**: Matches staff tags against event type required tags.
2. **Availability**: Checks staff's `user_availability` windows for the day of the week.
3. **Conflicts**: Checks if the staff is already assigned to another event at the same time.
4. **Workload**: Calculates if assigning the event would exceed the staff's `max_hours_per_week`.

## Deployment Architecture
- **Infrastructure as Code**: `docker-compose.yml` defines the multi-container environment (App + DB + Reverse Proxy).
- **Reverse Proxy**: Caddy (configured via `Caddyfile`) for SSL termination and static file serving.
- **CI/CD**: `cloudbuild.yaml` for automated builds and deployment to Google Cloud.
