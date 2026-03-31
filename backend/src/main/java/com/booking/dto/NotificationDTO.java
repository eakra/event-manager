package com.booking.dto;

import java.time.LocalDateTime;

public class NotificationDTO {
    public Long id;
    public String type;
    public Long relatedId;
    public String message;
    public boolean isRead;
    public String createdAt;

    public NotificationDTO() {}

    public NotificationDTO(Long id, String type, Long relatedId, String message, boolean isRead, LocalDateTime createdAt) {
        this.id = id;
        this.type = type;
        this.relatedId = relatedId;
        this.message = message;
        this.isRead = isRead;
        this.createdAt = createdAt.toString();
    }
}
