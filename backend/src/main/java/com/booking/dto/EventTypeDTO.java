package com.booking.dto;

import java.util.Set;

public class EventTypeDTO {
    public Long id;
    public String name;
    public String description;
    public Integer shiftDurationMinutes;
    public Integer eventDurationMinutes;
    public Set<String> requiredTags;

    public EventTypeDTO() {}
}
