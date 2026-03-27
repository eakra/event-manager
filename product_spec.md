
The organization runs a range of different activities and events for young people aged 10-18 to develop skills and confidence. It uses a booking system that is accessed via its website to allow young people to register to attend specific sessions and it assigns staff members to deliver these events. At the moment, while information on staff is held in a Zoho People system, this staff assignment process is entirely manual and takes up a lot of time on the part of the organization's administrator.

We want to create a web application that will help to streamline the process of assigning staff to events and keeping track of which staff delivered which events. There is a fixed list of types of event that are delivered, which may change over time. Each event type is offered on a number of dates and the combination of event types and dates forms a calendar of events that is exposed through the booking system to allow young people to register. Ultimately, it may be possible to pull information from the booking system via an API and it may be possible to pull information on staff availability e.g. holiday dates from the Zoho system but in the first instance the system that is developed should provide that capability to enter this information via a user interface.

Key functionality that is desirable in the initial application includes:

1. The ability to enter, view and edit information about each event type, e.g. event name, event description, duration, etc. In some cases, event may require that staff have specific qualifications or experience to deliver them.

2. The ability to enter, view and edit information about specific instances of an event, e.g. date, location.

3. The ability to enter, view and edit information about locations at which events may take place.

4. The ability to enter information about staff, e.g. name, email address, available hours per week, qualifications and experince, holiday dates.

5. The ability to assign staff to events - when viewing an event instance, show a list of staff available on the date of the event, potentially limiting staff shown to those that have the required qualifications and experience to deliver the event, show the number of hours the staff member is already committed to in that week. An OnHover popup showing events in that week for a staff member would be beneficial.

6. The ability to view upcoming (and historic) events in different formats, e.g. list, calendar display, etc.

7. The ability for the administrator to generate emails to staff members showing which events they are assigned to in any given week.

~
