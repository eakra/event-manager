package com.booking.resource;

import com.booking.dto.ParticipantDTO;
import com.booking.entity.User;
import com.booking.entity.UserRole;
import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.util.List;
import java.util.stream.Collectors;

@Path("/api/participants")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed({"ADMIN", "STAFF"})
public class ParticipantResource {

    @GET
    public List<ParticipantDTO> list() {
        return User.<User>list("role", UserRole.PARTICIPANT).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private ParticipantDTO toDTO(User user) {
        ParticipantDTO dto = new ParticipantDTO();
        dto.id = user.id;
        dto.name = user.name;
        dto.email = user.email;
        dto.dateOfBirth = user.dateOfBirth;
        return dto;
    }
}
