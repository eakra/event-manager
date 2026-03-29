# Functional Requirements Document (FRD)

## User Roles
1. **Admin**: full system access, manages all entities, publishes events, and triggers notifications.
2. **Staff**: manages own availability, qualifications, and holidays; views schedule; can self-assign/unassign if allowed.
3. **Participant**: registers for published events via a public/authenticated portal.

## Core Features

### 1. Resource Management (Admin Only)
- **Tag Management**: CRUD operations for qualifications (e.g., "First Aid").
- **Location Management**: CRUD operations for venues, including capacity and contact info.
- **Event Type Management**: CRUD for templates defining name, duration, and required staff qualifications.
- **Staff Management**: CRUD for staff accounts, initial availability, and max hours.

### 2. Event Scheduling (Admin Only)
- **Creation**: Admins create individual event instances from types, choosing a date, time, and location.
- **Draft State**: New events start as "DRAFT" and are not visible to participants.
- **Publishing**: Events can only be published once minimum staffing requirements are met.

### 3. Staff Assignment Engine
This is the core business logic of the application. When viewing an event instance, the system evaluates all staff members and provides a list with clear status indicators:
- **Perfect Match**: Staff has required tags, is available during that time, has no overlap, and is within weekly hour limits.
- **Warnings**:
    - *Missing Qualification*: Staff lacks one or more required tags.
    - *Outside Available Hours*: The event time falls outside the staff's defined availability for that day.
    - *Exceeds Weekly Hour Limit*: Assigning this event would push the staff over their max hours for the week.
    - *Scheduling Conflict*: The staff is already assigned to another event overlapping this time.
    - *On Holiday*: The event date falls within a staff-defined holiday range.

### 4. Staff Self-Service
- **Availability Matrix**: Staff can define their working hours for each day of the week.
- **Qualification Updates**: Staff can update their own tags/qualifications.
- **Holiday Management**: Staff can add/remove date ranges for holidays.
- **Schedule View**: Personal view of upcoming assigned events.

### 5. Participant Portal
- **Discovery**: View list of published upcoming events.
- **Registration**: Register for events with age-appropriateness checks (implied by schema Age fields).
- **Profile**: Basic registration info (name, DOB).

### 6. Communications
- **Weekly Schedule Email**: Admin triggers a batch email process that sends a formatted schedule to each staff member for a selected week.
