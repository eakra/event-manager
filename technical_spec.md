Technical Specification: Youth Organization Event Staffing System
1. Architecture & Tech Stack
Frontend: React (TypeScript recommended for strict agent typing), utilizing a standard responsive CSS framework (e.g., Tailwind CSS or Material UI).

Backend: Java Quarkus exposing a RESTful API.

Database: PostgreSQL (Standard, reliable, and easily supports complex relationship queries).

Authentication: JWT-based login system with role-based access control (Roles: ADMIN, STAFF).

Email Generation: Quarkus Mailer extension (SMTP) to construct and dispatch emails directly from the backend.

2. Data Dictionary & Entities
User (Staff/Admin)

id, name, email (unique), passwordHash, role (ADMIN or STAFF).

maxHoursPerWeek (Integer).

tags (Many-to-Many mapping to Tag entity).

availability (JSON or relational table mapping specific days of the week to available hours, e.g., Monday: 09:00-17:00).

Tag

id, name (e.g., "First Aid Certified", "Senior Facilitator").

Location

id, name, addressLine1, addressLine2, city, zipCode.

contactName, contactPhone, contactEmail.

defaultCapacity (Integer).

EventType

id, name, description.

durationMinutes (Integer).

requiredTags (Many-to-Many mapping to Tag entity).

EventInstance

id, eventTypeId (Foreign Key), locationId (Foreign Key).

date (YYYY-MM-DD).

startTime (HH:MM). (End time is dynamically calculated frontend/backend using EventType duration).

status (Enum: DRAFT, PUBLISHED, STAFFED, COMPLETED, CANCELLED).

capacityOverride (Integer, nullable).

EventAssignment

id, eventInstanceId (Foreign Key), userId (Foreign Key - Staff).

3. Core Business Logic: The Assignment Engine
The most complex logic resides in the staff assignment endpoint (GET /api/events/{id}/available-staff). The backend must return a list of all staff members, augmented with sorting weights and warning flags.

The Algorithm:

Retrieve Event Needs: Fetch the EventInstance date/time, and its parent EventType required tags.

Calculate Current Load: For each staff member, calculate their total assigned hours for the week containing the event date.

Evaluate & Flag: For each staff member, generate a warningMessages array.

Check 1 (Tags): If the staff lacks a required tag -> Add "Missing qualification: [Tag Name]".

Check 2 (Availability): If the event time falls outside their defined available hours -> Add "Outside available hours".

Check 3 (Capacity): If assigning this event pushes them over their maxHoursPerWeek -> Add "Exceeds weekly hour limit".

Check 4 (Conflict): If they are already assigned to an event overlapping this time -> Add "Scheduling conflict with [Other Event Name]".

Sort: * Return the array sorted with "Perfect Matches" (empty warningMessages array) at the top.

Staff with warnings fall to the bottom, sorted alphabetically.

4. API Endpoint Contracts (Backend)
Auth: * POST /api/auth/login (Returns JWT)

Admin / Configuration:

CRUD /api/tags

CRUD /api/locations

Users / Staff:

CRUD /api/staff (Admin use)

GET /api/staff/{id}/schedule (Returns upcoming events for a user)

PUT /api/staff/{id}/availability (Staff updating their own hourly profile)

Events:

CRUD /api/event-types

CRUD /api/event-instances

GET /api/event-instances/{id}/available-staff (Triggers the Assignment Engine)

POST /api/event-instances/{id}/assign (Accepts staffId)

Communications:

POST /api/communications/notify-staff (Triggers email generation for a specific week's schedule).

5. Frontend Route Architecture
Public:

/login

Admin Dashboard:

/admin/events (Default view: Calendar/List toggle of Event Instances)

/admin/events/new (Creation wizard: Select Type -> Location -> Date/Time -> Status)

/admin/events/:id/assign (UI utilizing the Assignment Engine. Perfect matches shown natively; warned staff visually grayed out but clickable, with warningMessages mapped to a tooltip).

/admin/event-types (CRUD table)

/admin/staff (CRUD table & weekly notification trigger)

/admin/locations (CRUD table)

/admin/settings (Tags management UI)

Staff Dashboard:

/staff/schedule (View own assigned events)

/staff/profile (Matrix UI to toggle available hours per day)