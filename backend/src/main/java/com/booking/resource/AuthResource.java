package com.booking.resource;

import com.booking.dto.LoginRequest;
import com.booking.dto.LoginResponse;
import com.booking.entity.User;
import com.booking.security.TokenService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.mindrot.jbcrypt.BCrypt;

@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    TokenService tokenService;

    @POST
    @Path("/login")
    public Response login(@Valid LoginRequest request) {
        User user = User.findByEmail(request.email);
        if (user == null || !BCrypt.checkpw(request.password, user.passwordHash)) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Invalid email or password\"}")
                    .build();
        }

        String token = tokenService.generateToken(user);
        return Response.ok(new LoginResponse(token, user.name, user.email, user.role.name())).build();
    }

    @POST
    @Path("/register")
    @jakarta.transaction.Transactional
    public Response register(@Valid com.booking.dto.RegisterRequest request) {
        if (User.findByEmail(request.email) != null) {
            return Response.status(Response.Status.CONFLICT)
                    .entity("{\"error\":\"Email already in use\"}")
                    .build();
        }
        User user = new User();
        user.name = request.name;
        user.email = request.email;
        user.passwordHash = BCrypt.hashpw(request.password, BCrypt.gensalt());
        user.role = com.booking.entity.UserRole.PARTICIPANT;
        user.dateOfBirth = request.dateOfBirth;
        // Defaults to 0 for participants who don't work hours
        user.maxHoursPerWeek = 0; 
        user.persist();
        return Response.status(Response.Status.CREATED).build();
    }
}
