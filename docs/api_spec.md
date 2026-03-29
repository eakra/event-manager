# API Specification

## Base URL
`/api`

## Authentication
### POST `/auth/login`
- **Description**: Authenticates a user and returns a JWT.
- **Payload**: `{ "email": "...", "password": "..." }`
- **Response**: `200 OK` with `{ "token": "...", "name": "...", "email": "...", "role": "..." }`

### POST `/auth/register`
- **Description**: Registers a new participant.
- **Payload**: `{ "name": "...", "email": "...", "password": "...", "dateOfBirth": "YYYY-MM-DD" }`
- **Response**: `201 Created`

---

## Admin & Configuration

### Tags
- **GET `/tags`**: List all tags.
- **POST `/tags`**: Create a new tag.
- **PUT `/tags/{id}`**: Update a tag.
- **DELETE `/tags/{id}`**: Delete a tag.

### Locations
- **GET `/locations`**: List all locations.
- **POST `/locations`**: Create a new location.
- **PUT `/locations/{id}`**: Update a location.
- **DELETE `/locations/{id}`**: Delete a location.

### Event Types
- **GET `/event-types`**: List all event types.
- **POST `/event-types`**: Create a new event type.
- **PUT `/event-types/{id}`**: Update an event type.
- **DELETE `/event-types/{id}`**: Delete an event type.

---

## Staff Management

### Staff Profiles
- **GET `/staff`**: List all staff members (Admin only).
- **GET `/staff/{id}`**: Get staff details.
- **POST `/staff`**: Create a new staff account (Admin only).
- **PUT `/staff/{id}`**: Update staff details (Admin only).
- **DELETE `/staff/{id}`**: Delete a staff member (Admin only).

### Staff Self-Service
- **PUT `/staff/{id}/availability`**: Update staff weekly availability windows.
- **PUT `/staff/{id}/max-hours`**: Update staff maximum working hours per week.
- **PUT `/staff/{id}/tags`**: Update staff qualifications/tags.
- **GET `/staff/{id}/schedule`**: Get upcoming assigned events for the staff member.
- **GET/POST/DELETE `/staff/{id}/holidays`**: Manage staff holiday dates.

---

## Event Instances

### Schedule Management
- **GET `/event-instances`**: List event instances (supports `from`, `to`, `status` filters).
- **POST `/event-instances`**: Create a new event instance (Status: DRAFT).
- **GET `/event-instances/{id}`**: Get instance details.
- **PUT `/event-instances/{id}`**: Update instance details.
- **DELETE `/event-instances/{id}`**: Delete an instance.

### Staffing & Publishing
- **GET `/event-instances/{id}/available-staff`**: Triggers the Assignment Engine to return staff with availability/qualification warnings.
- **POST `/event-instances/{id}/assign`**: Assign a staff member.
- **DELETE `/event-instances/{id}/assign/{staffId}`**: Unassign a staff member.
- **POST `/event-instances/{id}/publish`**: Transition a DRAFT event to PUBLISHED (requires minimum staff).

---

## Participant Portal (Implicit from Controller names)
Endpoints for participants to view and register for published events.
- **GET `/participant/events`**: List published events for registration.
- **POST `/participant/events/{id}/register`**: Register for an event.
- **DELETE `/participant/events/{id}/register`**: Cancel registration.

---

## Communications
- **POST `/communications/notify-staff`**: Send weekly schedule emails to all assigned staff for a given date range.
