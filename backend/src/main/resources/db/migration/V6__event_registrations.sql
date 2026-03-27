-- V6: Event registrations for participants
CREATE TABLE event_registrations (
    id                BIGSERIAL PRIMARY KEY,
    event_instance_id BIGINT NOT NULL REFERENCES event_instances(id) ON DELETE CASCADE,
    user_id           BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    registration_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (event_instance_id, user_id)
);

CREATE INDEX idx_event_registrations_user ON event_registrations(user_id);
CREATE INDEX idx_event_registrations_instance ON event_registrations(event_instance_id);
