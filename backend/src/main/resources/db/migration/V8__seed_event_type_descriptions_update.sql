-- V8: Seed dummy descriptions for existing event types
UPDATE event_types SET description = 'A comprehensive workshop for aspiring leaders, covering team management and communication.' WHERE name = 'Leadership Workshop';
UPDATE event_types SET description = 'An exciting day of outdoor activities designed to build team spirit and resilience.' WHERE name = 'Outdoor Adventure Day';
UPDATE event_types SET description = 'Essential first aid training for young people, providing life-saving skills and certification.' WHERE name = 'First Aid Training';
