package com.booking.service;

import com.booking.dto.AvailableStaffDTO;
import com.booking.entity.*;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@ApplicationScoped
public class AssignmentEngine {

    /**
     * Evaluate all staff members for a given event instance.
     * Returns a list sorted with "perfect matches" (no warnings) first,
     * then warned staff alphabetically.
     */
    public List<AvailableStaffDTO> evaluateStaff(EventInstance eventInstance) {
        // Load event details
        EventType eventType = eventInstance.eventType;
        LocalDate eventDate = eventInstance.eventDate;
        LocalTime eventStart = eventInstance.startTime;
        LocalTime eventEnd = eventInstance.getEndTime();
        int eventDayOfWeek = eventDate.getDayOfWeek().getValue(); // 1=Mon..7=Sun

        // Get required tags
        Set<Long> requiredTagIds = eventType.requiredTags.stream()
                .map(t -> t.id)
                .collect(Collectors.toSet());

        // Week boundaries (Monday to Sunday)
        LocalDate weekStart = eventDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = weekStart.plusDays(6);

        // Get all staff members
        List<User> allStaff = User.list("role", UserRole.STAFF);

        List<AvailableStaffDTO> results = new ArrayList<>();

        for (User staff : allStaff) {
            AvailableStaffDTO dto = new AvailableStaffDTO();
            dto.id = staff.id;
            dto.name = staff.name;
            dto.email = staff.email;
            dto.maxHoursPerWeek = staff.maxHoursPerWeek;
            dto.warningMessages = new ArrayList<>();

            // --- Check 1: Tags ---
            Set<Long> staffTagIds = staff.tags.stream()
                    .map(t -> t.id)
                    .collect(Collectors.toSet());
            for (Tag requiredTag : eventType.requiredTags) {
                if (!staffTagIds.contains(requiredTag.id)) {
                    dto.warningMessages.add("Missing qualification: " + requiredTag.name);
                }
            }

            // --- Check 2: Availability ---
            boolean withinAvailableHours = false;
            for (UserAvailability av : staff.availability) {
                if (av.dayOfWeek == eventDayOfWeek) {
                    if (!eventStart.isBefore(av.startTime) && !eventEnd.isAfter(av.endTime)) {
                        withinAvailableHours = true;
                        break;
                    }
                }
            }
            if (!withinAvailableHours && !staff.availability.isEmpty()) {
                dto.warningMessages.add("Outside available hours");
            }

            // --- Check 3: Weekly hour capacity ---
            double currentWeekHours = calculateWeekHours(staff.id, weekStart, weekEnd);
            dto.currentWeekHours = currentWeekHours;
            double eventHours = eventType.durationMinutes / 60.0;
            if (currentWeekHours + eventHours > staff.maxHoursPerWeek) {
                dto.warningMessages.add("Exceeds weekly hour limit");
            }

            // --- Check 4: Scheduling conflict ---
            List<EventAssignment> weekAssignments = EventAssignment.list(
                "user.id = ?1 AND eventInstance.eventDate = ?2",
                staff.id, eventDate);

            for (EventAssignment assignment : weekAssignments) {
                EventInstance other = assignment.eventInstance;
                // Skip the current event
                if (other.id.equals(eventInstance.id)) continue;

                LocalTime otherStart = other.startTime;
                LocalTime otherEnd = other.getEndTime();

                // Check for time overlap
                if (eventStart.isBefore(otherEnd) && eventEnd.isAfter(otherStart)) {
                    dto.warningMessages.add("Scheduling conflict with " + other.eventType.name);
                }
            }

            // --- Check 5: Holidays ---
            for (UserHoliday holiday : staff.holidays) {
                if (!eventDate.isBefore(holiday.startDate) && !eventDate.isAfter(holiday.endDate)) {
                    dto.onHoliday = true;
                    dto.warningMessages.add("On holiday");
                    break;
                }
            }

            dto.perfectMatch = dto.warningMessages.isEmpty();
            results.add(dto);
        }

        // Sort: On holiday absolute bottom, perfect matches first, then alphabetically by name
        results.sort((a, b) -> {
            if (a.onHoliday != b.onHoliday) return a.onHoliday ? 1 : -1;
            if (a.perfectMatch && !b.perfectMatch) return -1;
            if (!a.perfectMatch && b.perfectMatch) return 1;
            return a.name.compareToIgnoreCase(b.name);
        });

        return results;
    }

    /**
     * Calculate total assigned hours for a staff member in a given week.
     */
    private double calculateWeekHours(Long staffId, LocalDate weekStart, LocalDate weekEnd) {
        List<EventAssignment> assignments = EventAssignment.list(
            "user.id = ?1 AND eventInstance.eventDate >= ?2 AND eventInstance.eventDate <= ?3",
            staffId, weekStart, weekEnd);

        return assignments.stream()
                .mapToDouble(a -> a.eventInstance.eventType.durationMinutes / 60.0)
                .sum();
    }
}
