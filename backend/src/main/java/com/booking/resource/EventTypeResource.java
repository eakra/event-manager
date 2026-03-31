package com.booking.resource;

import com.booking.dto.EventTypeDTO;
import com.booking.entity.EventType;
import com.booking.entity.Tag;
import jakarta.annotation.security.RolesAllowed;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.net.URI;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Path("/api/event-types")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed({"ADMIN", "STAFF"})
public class EventTypeResource {

    public static class EventTypeRequest {
        public String name;
        public String description;
        public Integer shiftDurationMinutes;
        public Integer eventDurationMinutes;
        public Integer minStaff;
        public Integer maxStaff;
        public Integer maxParticipants;
        public Integer minAge;
        public Integer maxAge;
        public Set<Long> requiredTagIds;
    }

    @GET
    @Transactional
    public List<EventTypeDTO> list() {
        return EventType.<EventType>listAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @GET
    @Path("/{id}")
    @Transactional
    public EventTypeDTO get(@PathParam("id") Long id) {
        EventType et = EventType.findById(id);
        if (et == null) throw new NotFoundException("EventType not found");
        return toDTO(et);
    }

    @POST
    @Transactional
    public Response create(EventTypeRequest request) {
        EventType et = new EventType();
        et.name = request.name;
        et.description = request.description;
        et.shiftDurationMinutes = request.shiftDurationMinutes != null ? request.shiftDurationMinutes : 60;
        et.eventDurationMinutes = request.eventDurationMinutes;
        et.minStaff = request.minStaff != null ? request.minStaff : 1;
        et.maxStaff = request.maxStaff != null ? request.maxStaff : 2;
        et.maxParticipants = request.maxParticipants != null ? request.maxParticipants : 20;
        et.minAge = request.minAge != null ? request.minAge : 10;
        et.maxAge = request.maxAge != null ? request.maxAge : 18;
        et.requiredTags = resolveTagIds(request.requiredTagIds);
        et.persist();
        return Response.created(URI.create("/api/event-types/" + et.id)).entity(toDTO(et)).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public EventTypeDTO update(@PathParam("id") Long id, EventTypeRequest request) {
        EventType et = EventType.findById(id);
        if (et == null) throw new NotFoundException("EventType not found");
        et.name = request.name;
        et.description = request.description;
        if (request.shiftDurationMinutes != null) et.shiftDurationMinutes = request.shiftDurationMinutes;
        if (request.eventDurationMinutes != null) et.eventDurationMinutes = request.eventDurationMinutes;
        if (request.minStaff != null) et.minStaff = request.minStaff;
        if (request.maxStaff != null) et.maxStaff = request.maxStaff;
        if (request.maxParticipants != null) et.maxParticipants = request.maxParticipants;
        if (request.minAge != null) et.minAge = request.minAge;
        if (request.maxAge != null) et.maxAge = request.maxAge;
        et.requiredTags = resolveTagIds(request.requiredTagIds);
        return toDTO(et);
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        boolean deleted = EventType.deleteById(id);
        if (!deleted) throw new NotFoundException("EventType not found");
        return Response.noContent().build();
    }

    private Set<Tag> resolveTagIds(Set<Long> tagIds) {
        Set<Tag> tags = new HashSet<>();
        if (tagIds != null) {
            for (Long tagId : tagIds) {
                Tag tag = Tag.findById(tagId);
                if (tag != null) {
                    tags.add(tag);
                }
            }
        }
        return tags;
    }

    private EventTypeDTO toDTO(EventType et) {
        EventTypeDTO dto = new EventTypeDTO();
        dto.id = et.id;
        dto.name = et.name;
        dto.description = et.description;
        dto.shiftDurationMinutes = et.shiftDurationMinutes;
        dto.eventDurationMinutes = et.eventDurationMinutes;
        dto.minStaff = et.minStaff;
        dto.maxStaff = et.maxStaff;
        dto.maxParticipants = et.maxParticipants;
        dto.minAge = et.minAge;
        dto.maxAge = et.maxAge;
        dto.requiredTags = et.requiredTags.stream()
                .map(t -> new TagDTO(t.id, t.name))
                .collect(Collectors.toSet());
        return dto;
    }
}
