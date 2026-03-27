-- V2: Seed data for development

-- Admin user (password: admin123)
INSERT INTO users (name, email, password_hash, role, max_hours_per_week) VALUES
    ('Admin User', 'admin@booking-app.local', '$2a$10$PYFp4vF5/izccFo.m5f7YuHQVMfH/iYKw8gr2HGb/nzAVhjb9C3Oy', 'ADMIN', 40);

-- Sample tags
INSERT INTO tags (name) VALUES
    ('First Aid Certified'),
    ('Senior Facilitator'),
    ('DBS Checked'),
    ('Outdoor Activities'),
    ('Mental Health First Aider');

-- Sample locations
INSERT INTO locations (name, address_line1, city, zip_code, contact_name, contact_phone, contact_email, default_capacity) VALUES
    ('Community Centre', '123 High Street', 'London', 'EC1A 1BB', 'John Smith', '020 7946 0958', 'john@community.local', 30),
    ('Youth Club Hall', '45 Park Lane', 'Manchester', 'M1 4BT', 'Jane Doe', '0161 496 0123', 'jane@youthclub.local', 20);

-- Sample staff (password: staff123)
INSERT INTO users (name, email, password_hash, role, max_hours_per_week) VALUES
    ('Alice Johnson', 'alice@booking-app.local', '$2a$10$PYFp4vF5/izccFo.m5f7YuHQVMfH/iYKw8gr2HGb/nzAVhjb9C3Oy', 'STAFF', 20),
    ('Bob Williams', 'bob@booking-app.local', '$2a$10$PYFp4vF5/izccFo.m5f7YuHQVMfH/iYKw8gr2HGb/nzAVhjb9C3Oy', 'STAFF', 30);

-- Assign tags to staff
INSERT INTO user_tags (user_id, tag_id) VALUES
    (2, 1), -- Alice: First Aid
    (2, 3), -- Alice: DBS Checked
    (3, 2), -- Bob: Senior Facilitator
    (3, 3), -- Bob: DBS Checked
    (3, 4); -- Bob: Outdoor Activities

-- Staff availability (Alice: Mon-Wed 9-17, Bob: Tue-Fri 10-18)
INSERT INTO user_availability (user_id, day_of_week, start_time, end_time) VALUES
    (2, 1, '09:00', '17:00'),
    (2, 2, '09:00', '17:00'),
    (2, 3, '09:00', '17:00'),
    (3, 2, '10:00', '18:00'),
    (3, 3, '10:00', '18:00'),
    (3, 4, '10:00', '18:00'),
    (3, 5, '10:00', '18:00');

-- Sample event types
INSERT INTO event_types (name, description, duration_minutes) VALUES
    ('Leadership Workshop', 'Developing leadership skills for young people aged 14-18', 180),
    ('Outdoor Adventure Day', 'Full-day outdoor activities including hiking and team building', 360),
    ('First Aid Training', 'Basic first aid certification course for ages 12+', 120);

-- Require tags for event types
INSERT INTO event_type_tags (event_type_id, tag_id) VALUES
    (1, 2), -- Leadership Workshop requires Senior Facilitator
    (2, 4), -- Outdoor Adventure requires Outdoor Activities
    (2, 1), -- Outdoor Adventure requires First Aid
    (3, 1); -- First Aid Training requires First Aid Certified
