CREATE TABLE user_holidays (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    CONSTRAINT fk_user_holidays_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
