-- V3: Add capacities, staff limits, and demographic age ranges

ALTER TABLE event_types ADD COLUMN min_staff INTEGER NOT NULL DEFAULT 1;
ALTER TABLE event_types ADD COLUMN max_staff INTEGER NOT NULL DEFAULT 2;
ALTER TABLE event_types ADD COLUMN max_participants INTEGER NOT NULL DEFAULT 20;
ALTER TABLE event_types ADD COLUMN min_age INTEGER NOT NULL DEFAULT 10;
ALTER TABLE event_types ADD COLUMN max_age INTEGER NOT NULL DEFAULT 18;

ALTER TABLE event_instances ADD COLUMN min_staff INTEGER;
ALTER TABLE event_instances ADD COLUMN max_staff INTEGER;
ALTER TABLE event_instances ADD COLUMN max_participants INTEGER;
ALTER TABLE event_instances ADD COLUMN min_age INTEGER;
ALTER TABLE event_instances ADD COLUMN max_age INTEGER;
