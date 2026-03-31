package com.booking.dto;

import java.util.Set;

public class EventTypeDTO {
    public Long id;
    public String name;
    public String description;
    public Integer shiftDurationMinutes;
    public Integer eventDurationMinutes;
    public Integer minStaff;
    public Integer maxStaff;
    public Integer maxParticipants;
    public Integer minAge;
    public Integer maxAge;
    public Set<TagDTO> requiredTags;

    public EventTypeDTO() {}
}
