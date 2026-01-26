ALTER TABLE enrollments
    ADD COLUMN IF NOT EXISTS pre_order_enrollment_id BIGINT REFERENCES pre_order_enrollments(id);