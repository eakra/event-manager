package com.booking.security;

import com.booking.entity.User;
import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.time.Duration;
import java.util.Set;

@ApplicationScoped
public class TokenService {

    @ConfigProperty(name = "smallrye.jwt.new-token.issuer")
    String issuer;

    @ConfigProperty(name = "smallrye.jwt.new-token.lifespan", defaultValue = "86400")
    long lifespanSeconds;

    public String generateToken(User user) {
        return Jwt.issuer(issuer)
                .upn(user.email)
                .groups(Set.of(user.role.name()))
                .claim("userId", user.id)
                .claim("name", user.name)
                .expiresIn(Duration.ofSeconds(lifespanSeconds))
                .sign();
    }
}
