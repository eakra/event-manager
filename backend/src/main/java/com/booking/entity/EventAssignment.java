package com.booking.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

@Entity
@Table(name = "event_assignments",
       uniqueConstraints = @UniqueConstraint(columnNames = {"event_instance_id", "user_id"}))
public class EventAssignment extends BaseEntity {

    public enum AssignmentStatus {
        PENDING, APPROVED
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_instance_id", nullable = false)
    public EventInstance eventInstance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    public User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    public AssignmentStatus status = AssignmentStatus.PENDING;

    @Column(name = "decline_reason", length = 500)
    public String declineReason;
}
