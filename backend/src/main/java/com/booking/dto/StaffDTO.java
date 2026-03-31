package com.booking.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public class StaffDTO {
    public Long id;
    public String name;
    public String email;
    public String role;
    public Integer typicalHoursPerWeek;
    public Integer maxHoursPerWeek;
    public String phoneNumber;
    public Set<TagDTO> tags;
    public List<AvailabilityDTO> availability;
    public List<HolidayDTO> holidays = new ArrayList<>();

    public static class TagDTO {
        public Long id;
        public String name;

        public TagDTO() {}

        public TagDTO(Long id, String name) {
            this.id = id;
            this.name = name;
        }
    }

    public static class AvailabilityDTO {
        public Long id;
        public Integer dayOfWeek;
        public String startTime;
        public String endTime;

        public AvailabilityDTO() {}

        public AvailabilityDTO(Long id, Integer dayOfWeek, String startTime, String endTime) {
            this.id = id;
            this.dayOfWeek = dayOfWeek;
            this.startTime = startTime;
            this.endTime = endTime;
        }
    }

    public static class HolidayDTO {
        public Long id;
        public String startDate;
        public String endDate;
        public String status;

        public HolidayDTO() {}

        public HolidayDTO(Long id, String startDate, String endDate, String status) {
            this.id = id;
            this.startDate = startDate;
            this.endDate = endDate;
            this.status = status;
        }
    }
}
