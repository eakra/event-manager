package com.booking.dto;

import java.util.List;

/**
 * Returned by the Assignment Engine for each staff member
 * when evaluating availability for an event instance.
 */
public class AvailableStaffDTO {
    public Long id;
    public String name;
    public String email;
    public Integer maxHoursPerWeek;
    public Double currentWeekHours;
    public List<String> warningMessages;
    public boolean perfectMatch;
    public boolean onHoliday;
    public boolean canAssign = true;

    public AvailableStaffDTO() {}
}
