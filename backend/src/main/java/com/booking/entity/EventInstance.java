package com.booking.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "event_instances")
public class EventInstance extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_type_id", nullable = false)
    public EventType eventType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    public Location location;

    @Column(name = "event_date", nullable = false)
    public LocalDate eventDate;

    @Column(name = "start_time", nullable = false)
    public LocalTime startTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    public EventStatus status = EventStatus.DRAFT;

    @Column(columnDefinition = "TEXT")
    public String description;

    @Column(name = "capacity_override")
    public Integer capacityOverride;

    @Column(name = "min_staff")
    public Integer minStaff;

    @Column(name = "max_staff")
    public Integer maxStaff;

    @Column(name = "max_participants")
    public Integer maxParticipants;

    @Column(name = "min_age")
    public Integer minAge;

    @Column(name = "max_age")
    public Integer maxAge;

    @OneToMany(mappedBy = "eventInstance", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<EventAssignment> assignments = new ArrayList<>();

    @OneToMany(mappedBy = "eventInstance", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<EventRegistration> registrations = new ArrayList<>();

    /**
     * Calculates the end time based on the event type's duration.
     */
    public LocalTime getEndTime() {
        if (eventType != null && eventType.durationMinutes != null) {
            return startTime.plusMinutes(eventType.durationMinutes);
        }
        return startTime;
    }

    public Integer getEffectiveMinStaff() {
        return minStaff != null ? minStaff : (eventType != null ? eventType.minStaff : 1);
    }

    public Integer getEffectiveMaxStaff() {
        return maxStaff != null ? maxStaff : (eventType != null ? eventType.maxStaff : 2);
    }

    public Integer getEffectiveMaxParticipants() {
        return maxParticipants != null ? maxParticipants : (eventType != null ? eventType.maxParticipants : 20);
    }

    public Integer getEffectiveMinAge() {
        return minAge != null ? minAge : (eventType != null ? eventType.minAge : 10);
    }

    public Integer getEffectiveMaxAge() {
        return maxAge != null ? maxAge : (eventType != null ? eventType.maxAge : 18);
    }
}
