# Data Model Specification

## Overview
The application uses a relational database (PostgreSQL) to manage users, events, locations, and staff assignments. The schema is designed to support role-based access control and semi-automated staff scheduling.

## Entities

### 1. Users (`users`)
Stores information about administrators, staff members, and participants.
- `id`: BigSerial (PK)
- `name`: VARCHAR(150), Not Null
- `email`: VARCHAR(200), Not Null, Unique
- `password_hash`: VARCHAR(255), Not Null
- `role`: VARCHAR(20), Not Null, Default 'STAFF' (Enum: ADMIN, STAFF, PARTICIPANT)
- `max_hours_per_week`: INTEGER, Not Null, Default 40

### 2. Tags (`tags`)
Qualifications, skills, or labels that can be assigned to staff and required by event types.
- `id`: BigSerial (PK)
- `name`: VARCHAR(100), Not Null, Unique (e.g., "First Aid", "Level 1 Coach")

### 3. User Tags (`user_tags`)
Many-to-many relationship between users and tags.
- `user_id`: BIGINT (FK -> users.id), PK
- `tag_id`: BIGINT (FK -> tags.id), PK

### 4. User Availability (`user_availability`)
Defines the time windows when a staff member is available to work.
- `id`: BigSerial (PK)
- `user_id`: BIGINT (FK -> users.id), Not Null
- `day_of_week`: INTEGER, Not Null (1-7, where 1=Monday)
- `start_time`: TIME, Not Null
- `end_time`: TIME, Not Null

### 5. Locations (`locations`)
Venues where events take place.
- `id`: BigSerial (PK)
- `name`: VARCHAR(200), Not Null
- `address_line1`: VARCHAR(255)
- `address_line2`: VARCHAR(255)
- `city`: VARCHAR(100)
- `zip_code`: VARCHAR(20)
- `contact_name`: VARCHAR(150)
- `contact_phone`: VARCHAR(50)
- `contact_email`: VARCHAR(150)
- `default_capacity`: INTEGER

### 6. Event Types (`event_types`)
Templates for recurring event categories.
- `id`: BigSerial (PK)
- `name`: VARCHAR(200), Not Null
- `description`: TEXT
- `duration_minutes`: INTEGER, Not Null

### 7. Event Type Tags (`event_type_tags`)
Many-to-many relationship defining the tags (qualifications) required to staff an event type.
- `event_type_id`: BIGINT (FK -> event_types.id), PK
- `tag_id`: BIGINT (FK -> tags.id), PK

### 8. Event Instances (`event_instances`)
Specific scheduled occurrences of an event type.
- `id`: BigSerial (PK)
- `event_type_id`: BIGINT (FK -> event_types.id), Not Null
- `location_id`: BIGINT (FK -> locations.id), Not Null
- `event_date`: DATE, Not Null
- `start_time`: TIME, Not Null
- `status`: VARCHAR(20), Not Null, Default 'DRAFT' (Enum: DRAFT, PUBLISHED, STAFFED, COMPLETED, CANCELLED)
- `capacity_override`: INTEGER (Optional override of location's default capacity)

### 9. Event Assignments (`event_assignments`)
Maps staff members to specific event instances.
- `id`: BigSerial (PK)
- `event_instance_id`: BIGINT (FK -> event_instances.id), Not Null
- `user_id`: BIGINT (FK -> users.id), Not Null
- Unique constraint on (`event_instance_id`, `user_id`)

## Relationships Diagram (Conceptual)
- `users` 1:N `user_availability`
- `users` M:N `tags` (via `user_tags`)
- `event_types` M:N `tags` (via `event_type_tags`)
- `event_types` 1:N `event_instances`
- `locations` 1:N `event_instances`
- `event_instances` M:N `users` (via `event_assignments`)
