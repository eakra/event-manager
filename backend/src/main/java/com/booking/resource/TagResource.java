package com.booking.resource;

import com.booking.entity.Tag;
import jakarta.annotation.security.RolesAllowed;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotBlank;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.net.URI;
import java.util.List;

@Path("/api/tags")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("ADMIN")
public class TagResource {

    public static class TagRequest {
        @NotBlank
        public String name;
    }

    @GET
    @RolesAllowed({"ADMIN", "STAFF"})
    public List<Tag> list() {
        return Tag.listAll();
    }

    @GET
    @Path("/{id}")
    public Tag get(@PathParam("id") Long id) {
        Tag tag = Tag.findById(id);
        if (tag == null) throw new NotFoundException("Tag not found");
        return tag;
    }

    @POST
    @Transactional
    public Response create(TagRequest request) {
        Tag tag = new Tag();
        tag.name = request.name;
        tag.persist();
        return Response.created(URI.create("/api/tags/" + tag.id)).entity(tag).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Tag update(@PathParam("id") Long id, TagRequest request) {
        Tag tag = Tag.findById(id);
        if (tag == null) throw new NotFoundException("Tag not found");
        tag.name = request.name;
        return tag;
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        boolean deleted = Tag.deleteById(id);
        if (!deleted) throw new NotFoundException("Tag not found");
        return Response.noContent().build();
    }
}
