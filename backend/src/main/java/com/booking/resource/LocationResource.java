package com.booking.resource;

import com.booking.entity.Location;
import jakarta.annotation.security.RolesAllowed;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.net.URI;
import java.util.List;

@Path("/api/locations")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed({"ADMIN", "STAFF"})
public class LocationResource {

    @GET
    @Transactional
    public List<Location> list() {
        return Location.listAll();
    }

    @GET
    @Path("/{id}")
    @Transactional
    public Location get(@PathParam("id") Long id) {
        Location loc = Location.findById(id);
        if (loc == null) throw new NotFoundException("Location not found");
        return loc;
    }

    @POST
    @Transactional
    public Response create(Location location) {
        location.id = null;
        location.persist();
        return Response.created(URI.create("/api/locations/" + location.id)).entity(location).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Location update(@PathParam("id") Long id, Location updated) {
        Location loc = Location.findById(id);
        if (loc == null) throw new NotFoundException("Location not found");
        loc.name = updated.name;
        loc.addressLine1 = updated.addressLine1;
        loc.addressLine2 = updated.addressLine2;
        loc.city = updated.city;
        loc.zipCode = updated.zipCode;
        loc.contactName = updated.contactName;
        loc.contactPhone = updated.contactPhone;
        loc.contactEmail = updated.contactEmail;
        loc.defaultCapacity = updated.defaultCapacity;
        return loc;
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        boolean deleted = Location.deleteById(id);
        if (!deleted) throw new NotFoundException("Location not found");
        return Response.noContent().build();
    }
}
