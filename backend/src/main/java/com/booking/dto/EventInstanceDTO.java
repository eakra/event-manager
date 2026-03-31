package com.booking.dto;

import com.booking.entity.EventStatus;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class EventInstanceDTO {
    public Long id;
    public Long eventTypeId;
    public String eventTypeName;
    public Integer durationMinutes;
    public Long locationId;
    public String locationName;
    public LocalDate eventDate;
    public LocalTime shiftStartTime;
    public LocalTime eventStartTime;
    public LocalTime shiftEndTime;
    public LocalTime eventEndTime;
    public Integer shiftDurationMinutes;
    public Integer eventDurationMinutes;
    public EventStatus status;
    public String description;
    public Integer capacityOverride;
    
    // Location details for Overview
    public String addressLine1;
    public String addressLine2;
    public String city;
    public String zipCode;
    public String contactName;
    public String contactPhone;
    public String contactEmail;
    
    public Integer minStaff;
    public Integer maxStaff;
    public Integer maxParticipants;
    public Integer minAge;
    public Integer maxAge;

    public Integer effectiveMinStaff;
    public Integer effectiveMaxStaff;
    public Integer effectiveMaxParticipants;
    public Integer effectiveMinAge;
    public Integer effectiveMaxAge;
    public List<StaffBriefDTO> assignedStaff;
    public Integer participantCount;
    public Boolean isRegistered;
    public List<String> requiredTags;

    public static class StaffBriefDTO {
        public Long id;
        public String name;
        public String email;

        public StaffBriefDTO(Long id, String name, String email) {
            this.id = id;
            this.name = name;
            this.email = email;
        }
    }
}
