package com.booking.resource;

import com.booking.dto.LocationDTO;
import com.booking.entity.Location;
import jakarta.annotation.security.RolesAllowed;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@Path("/api/locations")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed({"ADMIN", "STAFF"})
public class LocationResource {

    @GET
    @Transactional
    public List<LocationDTO> list() {
        return Location.<Location>listAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @GET
    @Path("/{id}")
    @Transactional
    public LocationDTO get(@PathParam("id") Long id) {
        Location loc = Location.findById(id);
        if (loc == null) throw new NotFoundException("Location not found");
        return toDTO(loc);
    }

    @POST
    @Transactional
    public Response create(Location location) {
        location.id = null;
        location.persist();
        return Response.created(URI.create("/api/locations/" + location.id)).entity(toDTO(location)).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public LocationDTO update(@PathParam("id") Long id, Location updated) {
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
        return toDTO(loc);
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        boolean deleted = Location.deleteById(id);
        if (!deleted) throw new NotFoundException("Location not found");
        return Response.noContent().build();
    }

    private LocationDTO toDTO(Location loc) {
        LocationDTO dto = new LocationDTO();
        dto.id = loc.id;
        dto.name = loc.name;
        dto.addressLine1 = loc.addressLine1;
        dto.addressLine2 = loc.addressLine2;
        dto.city = loc.city;
        dto.zipCode = loc.zipCode;
        dto.contactName = loc.contactName;
        dto.contactPhone = loc.contactPhone;
        dto.contactEmail = loc.contactEmail;
        dto.defaultCapacity = loc.defaultCapacity;
        return dto;
    }
}
