package com.booking.resource;

import com.booking.dto.*;
import com.booking.entity.*;
import com.booking.service.AssignmentEngine;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@Path("/api/event-instances")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EventInstanceResource {

    @Inject
    AssignmentEngine assignmentEngine;
    
    @Inject
    org.eclipse.microprofile.jwt.JsonWebToken jwt;

    @GET
    @RolesAllowed({"ADMIN", "STAFF"})
    public List<EventInstanceDTO> list(
            @QueryParam("from") String from,
            @QueryParam("to") String to,
            @QueryParam("status") String status) {
        List<EventInstance> instances;
        if (from != null && to != null) {
            instances = EventInstance.list(
                "eventDate >= ?1 AND eventDate <= ?2 ORDER BY eventDate, eventStartTime",
                java.time.LocalDate.parse(from),
                java.time.LocalDate.parse(to));
        } else {
            instances = EventInstance.list("ORDER BY eventDate, eventStartTime");
        }

        if (status != null) {
            EventStatus filterStatus = EventStatus.valueOf(status.toUpperCase());
            instances = instances.stream()
                .filter(e -> e.status == filterStatus)
                .collect(Collectors.toList());
        }

        return instances.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({"ADMIN", "STAFF"})
    public EventInstanceDTO get(@PathParam("id") Long id) {
        EventInstance ei = EventInstance.findById(id);
        if (ei == null) throw new NotFoundException("EventInstance not found");
        return toDTO(ei);
    }

    @POST
    @Transactional
    @RolesAllowed("ADMIN")
    public Response create(@Valid EventInstanceCreateRequest request) {
        EventType eventType = EventType.findById(request.eventTypeId);
        if (eventType == null) throw new BadRequestException("EventType not found");

        Location location = Location.findById(request.locationId);
        if (location == null) throw new BadRequestException("Location not found");

        EventInstance ei = new EventInstance();
        ei.eventType = eventType;
        ei.location = location;
        ei.eventDate = request.eventDate;
        ei.shiftStartTime = request.shiftStartTime != null ? request.shiftStartTime : request.eventStartTime;
        ei.eventStartTime = request.eventStartTime;
        ei.shiftDurationMinutes = request.shiftDurationMinutes;
        ei.eventDurationMinutes = request.eventDurationMinutes;
        ei.status = EventStatus.DRAFT;
        ei.capacityOverride = request.capacityOverride;
        ei.minStaff = request.minStaff;
        ei.maxStaff = request.maxStaff;
        ei.maxParticipants = request.maxParticipants;
        ei.minAge = request.minAge;
        ei.maxAge = request.maxAge;
        ei.description = request.description;
        
        ei.validateTimings();
        ei.persist();
        return Response.created(URI.create("/api/event-instances/" + ei.id)).entity(toDTO(ei)).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    @RolesAllowed("ADMIN")
    public EventInstanceDTO update(@PathParam("id") Long id, @Valid EventInstanceCreateRequest request) {
        EventInstance ei = EventInstance.findById(id);
        if (ei == null) throw new NotFoundException("EventInstance not found");

        EventType eventType = EventType.findById(request.eventTypeId);
        if (eventType == null) throw new BadRequestException("EventType not found");

        Location location = Location.findById(request.locationId);
        if (location == null) throw new BadRequestException("Location not found");

        ei.eventType = eventType;
        ei.location = location;
        ei.eventDate = request.eventDate;
        ei.shiftStartTime = request.shiftStartTime != null ? request.shiftStartTime : request.eventStartTime;
        ei.eventStartTime = request.eventStartTime;
        ei.shiftDurationMinutes = request.shiftDurationMinutes;
        ei.eventDurationMinutes = request.eventDurationMinutes;
        ei.capacityOverride = request.capacityOverride;
        ei.minStaff = request.minStaff;
        ei.maxStaff = request.maxStaff;
        ei.maxParticipants = request.maxParticipants;
        ei.minAge = request.minAge;
        ei.maxAge = request.maxAge;
        ei.description = request.description;
        
        ei.validateTimings();
        return toDTO(ei);
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    @RolesAllowed("ADMIN")
    public Response delete(@PathParam("id") Long id) {
        boolean deleted = EventInstance.deleteById(id);
        if (!deleted) throw new NotFoundException("EventInstance not found");
        return Response.noContent().build();
    }

    /**
     * Assignment Engine: returns staff with availability warnings.
     */
    @GET
    @Path("/{id}/available-staff")
    @RolesAllowed({"ADMIN", "STAFF"})
    public List<AvailableStaffDTO> getAvailableStaff(@PathParam("id") Long id) {
        EventInstance ei = EventInstance.findById(id);
        if (ei == null) throw new NotFoundException("EventInstance not found");
        return assignmentEngine.evaluateStaff(ei);
    }

    /**
     * Assign a staff member to this event instance.
     */
    @POST
    @Path("/{id}/assign")
    @Transactional
    @RolesAllowed({"ADMIN", "STAFF"})
    public Response assignStaff(@PathParam("id") Long id, @Valid AssignStaffRequest request) {
        User caller = User.find("email", jwt.getName()).firstResult();
        if (caller == null) throw new NotAuthorizedException("Bearer");
        if (caller.role != UserRole.ADMIN && !request.staffId.equals(caller.id)) {
            throw new ForbiddenException("Staff can only self-assign.");
        }
        
        EventInstance ei = EventInstance.findById(id);
        if (ei == null) throw new NotFoundException("EventInstance not found");

        User staff = User.findById(request.staffId);
        if (staff == null) throw new BadRequestException("Staff not found");

        // Check if already assigned
        boolean alreadyAssigned = ei.assignments.stream()
                .anyMatch(a -> a.user.id.equals(request.staffId));
        if (alreadyAssigned) {
            return Response.status(Response.Status.CONFLICT)
                    .entity("{\"error\":\"Staff is already assigned to this event\"}")
                    .build();
        }

        // Check if maximum staff limit is reached
        if (ei.assignments.size() >= ei.getEffectiveMaxStaff()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"maximum staff capacity for this event, unassign first\"}")
                    .build();
        }

        EventAssignment assignment = new EventAssignment();
        assignment.eventInstance = ei;
        assignment.user = staff;
        assignment.persist();

        return Response.ok(toDTO(ei)).build();
    }

    /**
     * Unassign a staff member from this event.
     */
    @DELETE
    @Path("/{id}/assign/{staffId}")
    @Transactional
    @RolesAllowed({"ADMIN", "STAFF"})
    public Response unassignStaff(@PathParam("id") Long id, @PathParam("staffId") Long staffId) {
        User caller = User.find("email", jwt.getName()).firstResult();
        if (caller == null) throw new NotAuthorizedException("Bearer");
        if (caller.role != UserRole.ADMIN && !staffId.equals(caller.id)) {
            throw new ForbiddenException("Staff can only self-unassign.");
        }
        
        long deleted = EventAssignment.delete("eventInstance.id = ?1 AND user.id = ?2", id, staffId);
        if (deleted == 0) throw new NotFoundException("Assignment not found");
        return Response.noContent().build();
    }

    /**
     * Publish a draft event.
     */
    @POST
    @Path("/{id}/publish")
    @RolesAllowed({"ADMIN", "STAFF"})
    @Transactional
    public Response publish(@PathParam("id") Long id) {
        EventInstance ei = EventInstance.findById(id);
        if (ei == null) throw new NotFoundException("EventInstance not found");

        if (ei.status == EventStatus.PUBLISHED) {
            return Response.ok(toDTO(ei)).build();
        }
        
        if (ei.assignments.size() < ei.getEffectiveMinStaff()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"Cannot publish: minimum staff requirement not met.\"}")
                    .build();
        }

        ei.status = EventStatus.PUBLISHED;
        ei.persist();
        return Response.ok(toDTO(ei)).build();
    }

    private EventInstanceDTO toDTO(EventInstance ei) {
        EventInstanceDTO dto = new EventInstanceDTO();
        dto.id = ei.id;
        dto.eventTypeId = ei.eventType.id;
        dto.eventTypeName = ei.eventType.name;
        dto.eventDurationMinutes = ei.getEffectiveEventDuration();
        dto.shiftDurationMinutes = ei.getEffectiveShiftDuration();
        dto.locationId = ei.location.id;
        dto.locationName = ei.location.name;
        dto.eventDate = ei.eventDate;
        dto.shiftStartTime = ei.shiftStartTime;
        dto.eventStartTime = ei.eventStartTime;
        dto.shiftEndTime = ei.getShiftEndTime();
        dto.eventEndTime = ei.getEventEndTime();
        dto.status = ei.status;
        dto.capacityOverride = ei.capacityOverride;
        dto.description = ei.description;
        
        // Populate location details
        dto.addressLine1 = ei.location.addressLine1;
        dto.addressLine2 = ei.location.addressLine2;
        dto.city = ei.location.city;
        dto.zipCode = ei.location.zipCode;
        dto.contactName = ei.location.contactName;
        dto.contactPhone = ei.location.contactPhone;
        dto.contactEmail = ei.location.contactEmail;
        
        dto.minStaff = ei.minStaff;
        dto.maxStaff = ei.maxStaff;
        dto.maxParticipants = ei.maxParticipants;
        dto.minAge = ei.minAge;
        dto.maxAge = ei.maxAge;
        dto.effectiveMinStaff = ei.getEffectiveMinStaff();
        dto.effectiveMaxStaff = ei.getEffectiveMaxStaff();
        dto.effectiveMaxParticipants = ei.getEffectiveMaxParticipants();
        dto.effectiveMinAge = ei.getEffectiveMinAge();
        dto.effectiveMaxAge = ei.getEffectiveMaxAge();
        
        dto.assignedStaff = ei.assignments.stream()
                .map(a -> new EventInstanceDTO.StaffBriefDTO(a.user.id, a.user.name, a.user.email))
                .collect(Collectors.toList());
        dto.participantCount = ei.registrations != null ? ei.registrations.size() : 0;
        dto.requiredTags = ei.eventType.requiredTags.stream()
                .map(t -> t.name)
                .collect(Collectors.toList());
        return dto;
    }
}
