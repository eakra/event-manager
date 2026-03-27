package com.booking.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "event_registrations", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"event_instance_id", "user_id"})
})
public class EventRegistration extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_instance_id", nullable = false)
    public EventInstance eventInstance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    public User user;

    @Column(name = "registration_date", nullable = false)
    public LocalDateTime registrationDate = LocalDateTime.now();

    public static EventRegistration findByEventAndUser(Long eventId, Long userId) {
        return find("eventInstance.id = ?1 and user.id = ?2", eventId, userId).firstResult();
    }
}
