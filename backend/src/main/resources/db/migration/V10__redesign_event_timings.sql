-- Redesign event timings to include shift and event durations

-- Event Types update
ALTER TABLE event_types ADD COLUMN shift_duration_minutes INTEGER NOT NULL DEFAULT 60;
ALTER TABLE event_types RENAME COLUMN duration_minutes TO event_duration_minutes;

-- Event Instances update
ALTER TABLE event_instances ADD COLUMN shift_start_time TIME;
ALTER TABLE event_instances RENAME COLUMN start_time TO event_start_time;
ALTER TABLE event_instances ADD COLUMN shift_duration_minutes INTEGER;
ALTER TABLE event_instances ADD COLUMN event_duration_minutes INTEGER;

-- Data Migration for existing records
-- For existing events, we assume shift starts at the same time as the event
UPDATE event_instances SET shift_start_time = event_start_time;

-- We don't strictly need to fill shift_duration_minutes/event_duration_minutes in event_instances
-- if we want them to fall back to EventType, but if we want to preserve current durations:
-- However, since EventInstance currently doesn't store duration, it always uses EventType's.
-- So we leave them NULL to indicate "use template defaults".
