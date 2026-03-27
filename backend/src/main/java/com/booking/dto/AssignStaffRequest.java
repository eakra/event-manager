package com.booking.dto;

import jakarta.validation.constraints.NotNull;

public class AssignStaffRequest {
    @NotNull
    public Long staffId;
}
