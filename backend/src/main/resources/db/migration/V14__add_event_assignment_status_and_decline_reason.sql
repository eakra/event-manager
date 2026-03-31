-- V14: Add status and decline_reason to event_assignments
ALTER TABLE event_assignments ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'PENDING';
ALTER TABLE event_assignments ADD COLUMN decline_reason VARCHAR(500);
