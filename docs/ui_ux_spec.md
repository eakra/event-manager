# UI/UX Specification

## Design System
- **Framework**: Material UI (MUI).
- **Theme**: Responsive layout with a side navigation drawer (AppLayout).
- **Color Palette**: Professional and modern (implied MUI defaults or custom theme.ts).

## User Flows

### 1. Admin: Scheduling and Staffing
1. Admin navigates to **Events** page.
2. Clicks "New Event" to open the **Creation Wizard**.
3. Selects Event Type, Location, Date, and Time. Saves as DRAFT.
4. From the Event Detail/List, clicks **"Assign Staff"**.
5. The Assignment UI displays staff sorted by suitability (Perfect Matches vs. Warnings).
6. Admin selects staff to assign.
7. Once minimum staff reached, Admin clicks **"Publish"**.

### 2. Staff: Updating Availability
1. Staff logs in and navigates to **Profile**.
2. Uses the **Availability Matrix** (time pickers/toggles) to set hours for Mon-Sun.
3. Updates qualifications or adds a holiday range.
4. Navigates to **Schedule** to see assigned events.

### 3. Participant: Registration
1. Participant logs in and sees **Upcoming Events**.
2. Clicks "Register" on an event.
3. System validates age/capacity and confirms registration.

## Page Breakdown

### Shared
- **Login/Register**: Standard forms with role selection or defaults.
- **Event Overview**: Read-only details of an event (Name, Time, Location, Description).

### Admin Dashboard (`/admin`)
- **Events**: Calendar or List view of all instances. Status labels (DRAFT, PUBLISHED).
- **Staff**: Table of all staff. Action buttons to view/edit or trigger "Notify Weekly Schedule".
- **Event Types**: Table of templates with "Required Tags" chips.
- **Locations**: Table of venues with capacity info.
- **Settings**: Tag management UI.

### Staff Dashboard (`/staff`)
- **Schedule**: Personal agenda view.
- **Profile**: Forms for Max Hours, Availability Matrix, Holidays, and Qualifications.

### Participant Dashboard (`/participant`)
- **Events**: List of available events with "Register/Cancel" buttons.
