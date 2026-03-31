package com.booking.resource;

import com.booking.dto.NotificationDTO;
import com.booking.entity.Notification;
import com.booking.entity.User;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.booking.entity.*;

@Path("/api/notifications")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class NotificationResource {

    @Inject
    JsonWebToken jwt;

    @GET
    @RolesAllowed({"ADMIN", "STAFF"})
    public List<NotificationDTO> list() {
        User user = User.findByEmail(jwt.getName());
        if (user == null) throw new NotAuthorizedException("User not found");

        List<Notification> notifications = Notification.list("recipient.id = ?1 ORDER BY createdAt DESC", user.id);
        return notifications.stream().map(n -> new NotificationDTO(
                n.id,
                n.type.name(),
                n.relatedId,
                n.message,
                n.isRead,
                n.createdAt
        )).collect(Collectors.toList());
    }

    @POST
    @Path("/{id}/approve")
    @RolesAllowed({"ADMIN", "STAFF"})
    @Transactional
    public Response approve(@PathParam("id") Long id) {
        User user = User.findByEmail(jwt.getName());
        Notification n = Notification.findById(id);
        if (n == null) throw new NotFoundException("Notification not found");

        if (n.type == Notification.NotificationType.ASSIGNMENT_REQUEST) {
            EventAssignment assignment = EventAssignment.find("eventInstance.id = ?1 AND user.id = ?2", n.relatedId, user.id).firstResult();
            if (assignment != null) {
                assignment.status = EventAssignment.AssignmentStatus.APPROVED;
            }
        } else if (n.type == Notification.NotificationType.HOLIDAY_REQUEST) {
            if (user.role != UserRole.ADMIN) throw new ForbiddenException();
            UserHoliday holiday = UserHoliday.findById(n.relatedId);
            if (holiday != null) {
                holiday.status = UserHoliday.HolidayStatus.APPROVED;
            }
        }

        n.isRead = true;
        return Response.ok().build();
    }

    @POST
    @Path("/{id}/decline")
    @RolesAllowed({"ADMIN", "STAFF"})
    @Transactional
    public Response decline(@PathParam("id") Long id, Map<String, String> request) {
        User user = User.findByEmail(jwt.getName());
        Notification n = Notification.findById(id);
        if (n == null) throw new NotFoundException("Notification not found");

        if (n.type == Notification.NotificationType.ASSIGNMENT_REQUEST) {
            String reason = request.get("reason");
            if (reason == null || reason.isBlank()) throw new BadRequestException("Reason required");
            
            EventAssignment assignment = EventAssignment.find("eventInstance.id = ?1 AND user.id = ?2", n.relatedId, user.id).firstResult();
            if (assignment != null) {
                EventInstance ei = assignment.eventInstance;
                Notification.notifyAdmins(Notification.NotificationType.ASSIGNMENT_DECLINED, ei.id,
                        user.name + " declined " + ei.eventType.name + " on " + ei.eventDate + ". Reason: " + reason);
                assignment.delete();
            }
        } else if (n.type == Notification.NotificationType.HOLIDAY_REQUEST) {
            if (user.role != UserRole.ADMIN) throw new ForbiddenException();
            UserHoliday holiday = UserHoliday.findById(n.relatedId);
            if (holiday != null) {
                holiday.status = UserHoliday.HolidayStatus.REJECTED;
            }
        }

        n.isRead = true;
        return Response.ok().build();
    }
}
