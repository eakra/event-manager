package com.booking.resource;

import com.booking.dto.*;
import com.booking.entity.*;
import jakarta.annotation.security.RolesAllowed;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.mindrot.jbcrypt.BCrypt;

import jakarta.inject.Inject;
import java.net.URI;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Path("/api/staff")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class StaffResource {

    @Inject
    JsonWebToken jwt;

    @GET
    @RolesAllowed("ADMIN")
    @Transactional
    public List<StaffDTO> list() {
        List<User> users = User.list("role", UserRole.STAFF);
        return users.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({"ADMIN", "STAFF"})
    @Transactional
    public StaffDTO get(@PathParam("id") Long id) {
        User user = User.findById(id);
        if (user == null) throw new NotFoundException("Staff not found");
        return toDTO(user);
    }

    @POST
    @RolesAllowed("ADMIN")
    @Transactional
    public Response create(@Valid StaffCreateRequest request) {
        // Check for existing email
        if (User.findByEmail(request.email) != null) {
            return Response.status(Response.Status.CONFLICT)
                    .entity("{\"error\":\"Email already in use\"}")
                    .build();
        }

        User user = new User();
        user.name = request.name;
        user.email = request.email;
        user.passwordHash = BCrypt.hashpw(request.password, BCrypt.gensalt());
        user.role = UserRole.STAFF;
        user.typicalHoursPerWeek = request.typicalHoursPerWeek;
        user.maxHoursPerWeek = request.maxHoursPerWeek;
        user.phoneNumber = request.phoneNumber;

        // Resolve tags
        if (request.tagIds != null) {
            for (Long tagId : request.tagIds) {
                Tag tag = Tag.findById(tagId);
                if (tag != null) user.tags.add(tag);
            }
        }

        user.persist();
        
        // Add availability
        if (request.availability != null) {
            updateAvailabilityInternal(user, request.availability);
        }

        return Response.created(URI.create("/api/staff/" + user.id)).entity(toDTO(user)).build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed("ADMIN")
    @Transactional
    public StaffDTO update(@PathParam("id") Long id, StaffCreateRequest request) {
        User user = User.findById(id);
        if (user == null) throw new NotFoundException("Staff not found");

        user.name = request.name;
        user.email = request.email;
        user.typicalHoursPerWeek = request.typicalHoursPerWeek;
        user.maxHoursPerWeek = request.maxHoursPerWeek;
        user.phoneNumber = request.phoneNumber;

        if (request.password != null && !request.password.isBlank()) {
            user.passwordHash = BCrypt.hashpw(request.password, BCrypt.gensalt());
        }

        // Update tags
        if (request.tagIds != null) {
            user.tags.clear();
            for (Long tagId : request.tagIds) {
                Tag tag = Tag.findById(tagId);
                if (tag != null) user.tags.add(tag);
            }
        }

        // Update availability
        if (request.availability != null) {
            updateAvailabilityInternal(user, request.availability);
        }

        return toDTO(user);
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed("ADMIN")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        boolean deleted = User.deleteById(id);
        if (!deleted) throw new NotFoundException("Staff not found");
        return Response.noContent().build();
    }

    /**
     * Get staff schedule (upcoming events).
     */
    @GET
    @Path("/{id}/schedule")
    @RolesAllowed({"ADMIN", "STAFF"})
    public List<EventInstanceDTO> getSchedule(
            @PathParam("id") Long id,
            @QueryParam("from") String from,
            @QueryParam("to") String to) {
        User user = User.findById(id);
        if (user == null) throw new NotFoundException("Staff not found");

        LocalDate fromDate = from != null ? LocalDate.parse(from) : LocalDate.now();
        LocalDate toDate = to != null ? LocalDate.parse(to) : fromDate.plusMonths(3);

        List<EventAssignment> assignments = EventAssignment.list(
            "user.id = ?1 AND eventInstance.eventDate >= ?2 AND eventInstance.eventDate <= ?3 ORDER BY eventInstance.eventDate, eventInstance.eventStartTime",
            id, fromDate, toDate);

        return assignments.stream().map(a -> {
            EventInstance ei = a.eventInstance;
            EventInstanceDTO dto = new EventInstanceDTO();
            dto.id = ei.id;
            dto.eventTypeId = ei.eventType.id;
            dto.eventTypeName = ei.eventType.name;
            dto.eventDurationMinutes = ei.getEffectiveEventDuration();
            dto.locationId = ei.location.id;
            dto.locationName = ei.location.name;
            dto.eventDate = ei.eventDate;
            dto.shiftStartTime = ei.shiftStartTime;
            dto.eventStartTime = ei.eventStartTime;
            dto.shiftEndTime = ei.getShiftEndTime();
            dto.eventEndTime = ei.getEventEndTime();
            dto.shiftDurationMinutes = ei.getEffectiveShiftDuration();
            dto.eventDurationMinutes = ei.getEffectiveEventDuration();
            dto.status = ei.status;
            dto.effectiveMinStaff = ei.getEffectiveMinStaff();
            dto.effectiveMaxStaff = ei.getEffectiveMaxStaff();
            dto.assignedStaff = ei.assignments.stream()
                .map(a2 -> new EventInstanceDTO.StaffBriefDTO(a2.user.id, a2.user.name, a2.user.email))
                .collect(Collectors.toList());
            return dto;
        }).collect(Collectors.toList());
    }

    /**
     * Update staff availability.
     */
    @PUT
    @Path("/{id}/availability")
    @RolesAllowed({"ADMIN", "STAFF"})
    @Transactional
    public StaffDTO updateAvailability(@PathParam("id") Long id, List<StaffDTO.AvailabilityDTO> availabilityList) {
        User user = User.findById(id);
        if (user == null) throw new NotFoundException("Staff not found");

        updateAvailabilityInternal(user, availabilityList);

        return toDTO(user);
    }

    private void updateAvailabilityInternal(User user, List<StaffDTO.AvailabilityDTO> availabilityList) {
        // Clear old availability
        UserAvailability.delete("user.id", user.id);
        user.availability.clear();

        // Add new availability
        for (StaffDTO.AvailabilityDTO avDTO : availabilityList) {
            UserAvailability av = new UserAvailability();
            av.user = user;
            av.dayOfWeek = avDTO.dayOfWeek;
            av.startTime = LocalTime.parse(avDTO.startTime);
            av.endTime = LocalTime.parse(avDTO.endTime);
            av.persist();
            user.availability.add(av);
        }
    }

    public static class MaxHoursRequest {
        public Integer maxHours;
    }

    @PUT
    @Path("/{id}/max-hours")
    @RolesAllowed({"ADMIN", "STAFF"})
    @Transactional
    public StaffDTO updateMaxHours(@PathParam("id") Long id, MaxHoursRequest request) {
        User caller = User.find("email", jwt.getName()).firstResult();
        if (caller == null) throw new NotAuthorizedException("Bearer");
        if (caller.role != UserRole.ADMIN && !id.equals(caller.id)) {
            throw new ForbiddenException("Staff can only update their own max hours.");
        }

        User user = User.findById(id);
        if (user == null) throw new NotFoundException("Staff not found");

        if (request != null && request.maxHours != null && request.maxHours >= 0) {
            user.maxHoursPerWeek = request.maxHours;
        }

        return toDTO(user);
    }

    @PUT
    @Path("/{id}/tags")
    @RolesAllowed({"ADMIN", "STAFF"})
    @Transactional
    public StaffDTO updateTags(@PathParam("id") Long id, List<Long> tagIds) {
        User caller = User.find("email", jwt.getName()).firstResult();
        if (caller == null) throw new NotAuthorizedException("Bearer");
        if (caller.role != UserRole.ADMIN && !id.equals(caller.id)) {
            throw new ForbiddenException("Staff can only update their own qualifications.");
        }

        User user = User.findById(id);
        if (user == null) throw new NotFoundException("Staff not found");

        user.tags.clear();
        if (tagIds != null) {
            for (Long tagId : tagIds) {
                Tag tag = Tag.findById(tagId);
                if (tag != null) user.tags.add(tag);
            }
        }

        return toDTO(user);
    }

    public static class HolidayRequest {
        public String startDate;
        public String endDate;
    }

    @GET
    @Path("/{id}/holidays")
    @RolesAllowed({"ADMIN", "STAFF"})
    @Transactional
    public List<StaffDTO.HolidayDTO> getHolidays(@PathParam("id") Long id) {
        User user = User.findById(id);
        if (user == null) throw new NotFoundException("Staff not found");

        return user.holidays.stream()
                .map(h -> new StaffDTO.HolidayDTO(h.id, h.startDate.toString(), h.endDate.toString()))
                .collect(Collectors.toList());
    }

    @POST
    @Path("/{id}/holidays")
    @RolesAllowed({"ADMIN", "STAFF"})
    @Transactional
    public Response addHoliday(@PathParam("id") Long id, HolidayRequest request) {
        User caller = User.find("email", jwt.getName()).firstResult();
        if (caller == null) throw new NotAuthorizedException("Bearer");
        if (caller.role != UserRole.ADMIN && !id.equals(caller.id)) {
            throw new ForbiddenException("Staff can only update their own holidays.");
        }

        User user = User.findById(id);
        if (user == null) throw new NotFoundException("Staff not found");

        UserHoliday holiday = new UserHoliday();
        holiday.user = user;
        holiday.startDate = LocalDate.parse(request.startDate);
        holiday.endDate = LocalDate.parse(request.endDate);
        holiday.persist();
        
        user.holidays.add(holiday);

        return Response.status(Response.Status.CREATED).entity(new StaffDTO.HolidayDTO(holiday.id, holiday.startDate.toString(), holiday.endDate.toString())).build();
    }

    @DELETE
    @Path("/{id}/holidays/{holidayId}")
    @RolesAllowed({"ADMIN", "STAFF"})
    @Transactional
    public Response deleteHoliday(@PathParam("id") Long id, @PathParam("holidayId") Long holidayId) {
        User caller = User.find("email", jwt.getName()).firstResult();
        if (caller == null) throw new NotAuthorizedException("Bearer");
        if (caller.role != UserRole.ADMIN && !id.equals(caller.id)) {
            throw new ForbiddenException("Staff can only update their own holidays.");
        }

        User user = User.findById(id);
        if (user == null) throw new NotFoundException("Staff not found");

        boolean removed = user.holidays.removeIf(h -> h.id.equals(holidayId));
        if (removed) {
            UserHoliday.deleteById(holidayId);
        }

        return Response.noContent().build();
    }

    private StaffDTO toDTO(User user) {
        StaffDTO dto = new StaffDTO();
        dto.id = user.id;
        dto.name = user.name;
        dto.email = user.email;
        dto.role = user.role.name();
        dto.typicalHoursPerWeek = user.typicalHoursPerWeek;
        dto.maxHoursPerWeek = user.maxHoursPerWeek;
        dto.phoneNumber = user.phoneNumber;
        dto.tags = user.tags.stream()
                .map(t -> new StaffDTO.TagDTO(t.id, t.name))
                .collect(Collectors.toSet());
        dto.availability = user.availability.stream()
                .map(a -> new StaffDTO.AvailabilityDTO(a.id, a.dayOfWeek, a.startTime.toString(), a.endTime.toString()))
                .collect(Collectors.toList());
        dto.holidays = user.holidays.stream()
                .map(h -> new StaffDTO.HolidayDTO(h.id, h.startDate.toString(), h.endDate.toString()))
                .collect(Collectors.toList());
        return dto;
    }
}
