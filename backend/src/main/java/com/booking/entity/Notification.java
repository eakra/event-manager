package com.booking.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification extends BaseEntity {

    public enum NotificationType {
        ASSIGNMENT_REQUEST,
        HOLIDAY_REQUEST,
        ASSIGNMENT_DECLINED
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    public User recipient;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    public NotificationType type;

    @Column(name = "related_id")
    public Long relatedId;

    @Column(nullable = false, length = 500)
    public String message;

    @Column(name = "is_read", nullable = false)
    public boolean isRead = false;

    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt = LocalDateTime.now();

    public static void notifyAdmins(NotificationType type, Long relatedId, String message) {
        List<User> admins = User.list("role", UserRole.ADMIN);
        for (User admin : admins) {
            Notification n = new Notification();
            n.recipient = admin;
            n.type = type;
            n.relatedId = relatedId;
            n.message = message;
            n.persist();
        }
    }
}
