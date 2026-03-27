package com.booking.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class NotifyStaffRequest {
    @NotNull
    public LocalDate weekStartDate;
}
