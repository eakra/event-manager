package com.booking.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public class EventInstanceCreateRequest {

    @NotNull
    public Long eventTypeId;

    @NotNull
    public Long locationId;

    @NotNull
    public LocalDate eventDate;

    @NotNull
    public LocalTime startTime;

    public String status; // optional, defaults to DRAFT

    public String description;

    public Integer capacityOverride;

    public Integer minStaff;
    public Integer maxStaff;
    public Integer maxParticipants;
    public Integer minAge;
    public Integer maxAge;
}
