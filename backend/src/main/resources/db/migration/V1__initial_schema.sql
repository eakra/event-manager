-- V1: Initial schema for Youth Organization Event Staffing System

-- Tags (qualifications / labels)
CREATE TABLE tags (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE
);

-- Locations
CREATE TABLE locations (
    id               BIGSERIAL PRIMARY KEY,
    name             VARCHAR(200) NOT NULL,
    address_line1    VARCHAR(255),
    address_line2    VARCHAR(255),
    city             VARCHAR(100),
    zip_code         VARCHAR(20),
    contact_name     VARCHAR(150),
    contact_phone    VARCHAR(50),
    contact_email    VARCHAR(150),
    default_capacity INTEGER
);

-- Users (staff and admins)
CREATE TABLE users (
    id                BIGSERIAL PRIMARY KEY,
    name              VARCHAR(150) NOT NULL,
    email             VARCHAR(200) NOT NULL UNIQUE,
    password_hash     VARCHAR(255) NOT NULL,
    role              VARCHAR(20) NOT NULL DEFAULT 'STAFF',
    max_hours_per_week INTEGER NOT NULL DEFAULT 40
);

-- User tags (many-to-many)
CREATE TABLE user_tags (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tag_id  BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, tag_id)
);

-- User availability (per day-of-week time windows)
CREATE TABLE user_availability (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL,  -- 1=Monday .. 7=Sunday (ISO)
    start_time  TIME NOT NULL,
    end_time    TIME NOT NULL
);

-- Event types
CREATE TABLE event_types (
    id               BIGSERIAL PRIMARY KEY,
    name             VARCHAR(200) NOT NULL,
    description      TEXT,
    duration_minutes INTEGER NOT NULL
);

-- Event type required tags (many-to-many)
CREATE TABLE event_type_tags (
    event_type_id BIGINT NOT NULL REFERENCES event_types(id) ON DELETE CASCADE,
    tag_id        BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (event_type_id, tag_id)
);

-- Event instances
CREATE TABLE event_instances (
    id                BIGSERIAL PRIMARY KEY,
    event_type_id     BIGINT NOT NULL REFERENCES event_types(id) ON DELETE RESTRICT,
    location_id       BIGINT NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
    event_date        DATE NOT NULL,
    start_time        TIME NOT NULL,
    status            VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    capacity_override INTEGER
);

-- Event assignments (staff assigned to event instances)
CREATE TABLE event_assignments (
    id                BIGSERIAL PRIMARY KEY,
    event_instance_id BIGINT NOT NULL REFERENCES event_instances(id) ON DELETE CASCADE,
    user_id           BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (event_instance_id, user_id)
);

-- Indexes for common queries
CREATE INDEX idx_event_instances_date ON event_instances(event_date);
CREATE INDEX idx_event_assignments_user ON event_assignments(user_id);
CREATE INDEX idx_event_assignments_instance ON event_assignments(event_instance_id);
CREATE INDEX idx_user_availability_user ON user_availability(user_id);
