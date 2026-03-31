package com.booking.resource;

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
        public Set<Long> requiredTagIds;
    }

    @GET
    @Transactional
    public List<EventType> list() {
        return EventType.listAll();
    }

    @GET
    @Path("/{id}")
    @Transactional
    public EventType get(@PathParam("id") Long id) {
        EventType et = EventType.findById(id);
        if (et == null) throw new NotFoundException("EventType not found");
        return et;
    }

    @POST
    @Transactional
    public Response create(EventTypeRequest request) {
        EventType et = new EventType();
        et.name = request.name;
        et.description = request.description;
        et.shiftDurationMinutes = request.shiftDurationMinutes != null ? request.shiftDurationMinutes : 60;
        et.eventDurationMinutes = request.eventDurationMinutes;
        et.requiredTags = resolveTagIds(request.requiredTagIds);
        et.persist();
        return Response.created(URI.create("/api/event-types/" + et.id)).entity(et).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public EventType update(@PathParam("id") Long id, EventTypeRequest request) {
        EventType et = EventType.findById(id);
        if (et == null) throw new NotFoundException("EventType not found");
        et.name = request.name;
        et.description = request.description;
        if (request.shiftDurationMinutes != null) et.shiftDurationMinutes = request.shiftDurationMinutes;
        if (request.eventDurationMinutes != null) et.eventDurationMinutes = request.eventDurationMinutes;
        et.requiredTags = resolveTagIds(request.requiredTagIds);
        return et;
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
}
