-- Ensure admin user exists with correct password 'admin123'
INSERT INTO users (name, email, password_hash, role, max_hours_per_week, typical_hours_per_week)
SELECT 'Admin User', 'admin@booking-app.local', '$2a$10$PYFp4vF5/izccFo.m5f7YuHQVMfH/iYKw8gr2HGb/nzAVhjb9C3Oy', 'ADMIN', 40, 21
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@booking-app.local');

-- Ensure some locations exist
INSERT INTO locations (name, address_line1, city, zip_code, default_capacity)
SELECT 'Community Centre', '123 High Street', 'London', 'EC1A 1BB', 30
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Community Centre');

-- Ensure event types exist with NEW column names
INSERT INTO event_types (name, description, event_duration_minutes, shift_duration_minutes)
SELECT 'Leadership Workshop', 'Developing leadership skills for young people', 180, 240
WHERE NOT EXISTS (SELECT 1 FROM event_types WHERE name = 'Leadership Workshop');

INSERT INTO event_types (name, description, event_duration_minutes, shift_duration_minutes)
SELECT 'Outdoor Adventure Day', 'Full-day outdoor activities', 360, 480
WHERE NOT EXISTS (SELECT 1 FROM event_types WHERE name = 'Outdoor Adventure Day');
