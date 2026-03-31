package com.booking.resource;

import com.booking.dto.NotifyStaffRequest;
import com.booking.entity.*;
import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Path("/api/communications")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("ADMIN")
public class CommunicationsResource {

    @Inject
    Mailer mailer;

    @POST
    @Path("/notify-staff")
    public Response notifyStaff(@Valid NotifyStaffRequest request) {
        LocalDate weekStart = request.weekStartDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = weekStart.plusDays(6);

        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("EEEE, d MMMM yyyy");
        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm");

        // Get all assignments for the week
        List<EventAssignment> assignments = EventAssignment.list(
            "eventInstance.eventDate >= ?1 AND eventInstance.eventDate <= ?2 ORDER BY eventInstance.eventDate, eventInstance.eventStartTime",
            weekStart, weekEnd);

        // Group by staff member
        Map<Long, List<EventAssignment>> byStaff = assignments.stream()
                .collect(Collectors.groupingBy(a -> a.user.id));

        int emailsSent = 0;

        for (Map.Entry<Long, List<EventAssignment>> entry : byStaff.entrySet()) {
            User staff = entry.getValue().get(0).user;
            List<EventAssignment> staffAssignments = entry.getValue();

            StringBuilder body = new StringBuilder();
            body.append("Dear ").append(staff.name).append(",\n\n");
            body.append("Here is your schedule for the week of ")
                .append(weekStart.format(dateFmt)).append(" to ")
                .append(weekEnd.format(dateFmt)).append(":\n\n");

            for (EventAssignment a : staffAssignments) {
                EventInstance ei = a.eventInstance;
                body.append("• ").append(ei.eventType.name).append("\n");
                body.append("  Date: ").append(ei.eventDate.format(dateFmt)).append("\n");
                body.append("  Shift Time: ").append(ei.shiftStartTime.format(timeFmt))
                    .append(" - ").append(ei.getShiftEndTime().format(timeFmt)).append("\n");
                body.append("  Event Time: ").append(ei.eventStartTime.format(timeFmt))
                    .append(" - ").append(ei.getEventEndTime().format(timeFmt)).append("\n");
                body.append("  Location: ").append(ei.location.name).append("\n");
                if (ei.location.addressLine1 != null) {
                    body.append("  Address: ").append(ei.location.addressLine1);
                    if (ei.location.city != null) body.append(", ").append(ei.location.city);
                    body.append("\n");
                }
                body.append("\n");
            }

            body.append("If you have any questions, please contact the administrator.\n\n");
            body.append("Best regards,\nEvent Staffing System");

            mailer.send(Mail.withText(
                staff.email,
                "Your Schedule: Week of " + weekStart.format(DateTimeFormatter.ofPattern("d MMM yyyy")),
                body.toString()
            ));
            emailsSent++;
        }

        return Response.ok(Map.of(
            "message", "Notifications sent successfully",
            "emailsSent", emailsSent,
            "weekStart", weekStart.toString(),
            "weekEnd", weekEnd.toString()
        )).build();
    }
}
