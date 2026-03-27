package com.booking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Set;

public class StaffCreateRequest {

    @NotBlank
    public String name;

    @NotBlank
    @Email
    public String email;

    @NotBlank
    public String password;

    public Integer maxHoursPerWeek = 40;

    public Set<Long> tagIds;

    public List<StaffDTO.AvailabilityDTO> availability;
}
