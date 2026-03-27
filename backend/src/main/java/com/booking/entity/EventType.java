package com.booking.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "event_types")
public class EventType extends BaseEntity {

    @Column(nullable = false, length = 200)
    public String name;

    @Column(columnDefinition = "TEXT")
    public String description;

    @Column(name = "duration_minutes", nullable = false)
    public Integer durationMinutes;

    @Column(name = "min_staff", nullable = false)
    public Integer minStaff = 1;

    @Column(name = "max_staff", nullable = false)
    public Integer maxStaff = 2;

    @Column(name = "max_participants", nullable = false)
    public Integer maxParticipants = 20;

    @Column(name = "min_age", nullable = false)
    public Integer minAge = 10;

    @Column(name = "max_age", nullable = false)
    public Integer maxAge = 18;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "event_type_tags",
        joinColumns = @JoinColumn(name = "event_type_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    public Set<Tag> requiredTags = new HashSet<>();
}
