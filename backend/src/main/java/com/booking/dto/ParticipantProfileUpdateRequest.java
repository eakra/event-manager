package com.booking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ParticipantProfileUpdateRequest {
    @NotBlank(message = "Name is required")
    public String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email")
    public String email;

    public java.time.LocalDate dateOfBirth;
}
