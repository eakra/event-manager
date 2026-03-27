package com.booking.resource;

import com.booking.dto.EventInstanceDTO;
import com.booking.dto.ParticipantDTO;
import com.booking.dto.ParticipantProfileUpdateRequest;
import com.booking.entity.EventInstance;
import com.booking.entity.EventStatus;
import com.booking.entity.User;
import com.booking.entity.EventRegistration;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;
import java.util.stream.Collectors;

@Path("/api/participant")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("PARTICIPANT")
public class ParticipantPortalResource {

    @Inject
    JsonWebToken jwt;

    @GET
    @Path("/events")
    public List<EventInstanceDTO> getEvents() {
        return EventInstance.<EventInstance>list("status = ?1 ORDER BY eventDate, startTime", EventStatus.PUBLISHED)
                .stream().map(this::toEventDTO).collect(Collectors.toList());
    }

    @POST
    @Path("/events/{id}/register")
    @Transactional
    public EventInstanceDTO register(@PathParam("id") Long eventId) {
        User user = User.findByEmail(jwt.getName());
        EventInstance event = EventInstance.findById(eventId);
        if (event == null) throw new NotFoundException("Event not found");
        if (event.status != EventStatus.PUBLISHED) throw new BadRequestException("Event is not open for registration");

        if (event.registrations.size() >= event.getEffectiveMaxParticipants()) {
            throw new BadRequestException("Event is full");
        }

        if (EventRegistration.findByEventAndUser(eventId, user.id) != null) {
            throw new BadRequestException("Already registered");
        }

        EventRegistration reg = new EventRegistration();
        reg.eventInstance = event;
        reg.user = user;
        reg.persist();
        
        return toEventDTO(event);
    }

    @POST
    @Path("/events/{id}/unregister")
    @Transactional
    public EventInstanceDTO unregister(@PathParam("id") Long eventId) {
        User user = User.findByEmail(jwt.getName());
        EventRegistration reg = EventRegistration.findByEventAndUser(eventId, user.id);
        if (reg == null) throw new NotFoundException("Registration not found");
        
        EventInstance event = reg.eventInstance;
        event.registrations.remove(reg);
        reg.delete();
        
        return toEventDTO(event);
    }

    @GET
    @Path("/me")
    public ParticipantDTO getMyProfile() {
        User user = User.findByEmail(jwt.getName());
        if (user == null) {
            throw new NotFoundException("Profile not found");
        }
        return toParticipantDTO(user);
    }

    @PUT
    @Path("/me")
    @Transactional
    public ParticipantDTO updateMyProfile(@Valid ParticipantProfileUpdateRequest request) {
        User user = User.findByEmail(jwt.getName());
        if (user == null) {
            throw new NotFoundException("Profile not found");
        }
        
        if (!user.email.equals(request.email) && User.findByEmail(request.email) != null) {
            throw new BadRequestException("Email is already in use by another account");
        }

        user.name = request.name;
        user.email = request.email;
        user.dateOfBirth = request.dateOfBirth;
        return toParticipantDTO(user);
    }

    private ParticipantDTO toParticipantDTO(User user) {
        ParticipantDTO dto = new ParticipantDTO();
        dto.id = user.id;
        dto.name = user.name;
        dto.email = user.email;
        dto.dateOfBirth = user.dateOfBirth;
        return dto;
    }

    private EventInstanceDTO toEventDTO(EventInstance ei) {
        EventInstanceDTO dto = new EventInstanceDTO();
        dto.id = ei.id;
        dto.eventTypeId = ei.eventType.id;
        dto.eventTypeName = ei.eventType.name;
        dto.durationMinutes = ei.eventType.durationMinutes;
        dto.locationId = ei.location.id;
        dto.locationName = ei.location.name;
        dto.addressLine1 = ei.location.addressLine1;
        dto.addressLine2 = ei.location.addressLine2;
        dto.city = ei.location.city;
        dto.zipCode = ei.location.zipCode;
        dto.contactName = ei.location.contactName;
        dto.contactPhone = ei.location.contactPhone;
        dto.contactEmail = ei.location.contactEmail;
        dto.eventDate = ei.eventDate;
        dto.startTime = ei.startTime;
        dto.endTime = ei.getEndTime();
        dto.status = ei.status;
        dto.capacityOverride = ei.capacityOverride;
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
        
        dto.participantCount = ei.registrations.size();
        User currentUser = User.findByEmail(jwt.getName());
        if (currentUser != null) {
            dto.isRegistered = ei.registrations.stream().anyMatch(r -> r.user.id.equals(currentUser.id));
        }

        return dto;
    }
}
