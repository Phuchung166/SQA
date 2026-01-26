
-- alter table courses to add pre-order related columns
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_pre_order BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS pre_order_start_date TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS pre_order_end_date TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS pre_order_price DECIMAL(12,0);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS pre_order_total_slots INT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS pre_order_remaining_slots INT;

-- create table pre_order_enrollments

CREATE SEQUENCE IF NOT EXISTS pre_order_enrollment_id_seq START WITH 1 INCREMENT BY 1;


DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pre_order_status') THEN
            CREATE TYPE pre_order_status AS ENUM ('RESERVED', 'PAID', 'CONVERTED', 'CANCELLED', 'EXPIRED', 'REFUND_REQUESTED', 'REFUND_SUCCESS', 'REFUND_FAILED');
        END IF;
    END
$$;

CREATE TABLE IF NOT EXISTS pre_order_enrollments (
    id BIGINT NOT NULL ,
    course_id BIGINT,
    course_group_id BIGINT,
    user_id BIGINT NOT NULL,
    slot_number INTEGER NOT NULL ,
    pre_order_date TIMESTAMP WITHOUT TIME ZONE NOT NULL ,
    price_paid DECIMAL(12,0) NOT NULL ,
    status pre_order_status NOT NULL DEFAULT 'RESERVED',
    payment_id VARCHAR(100) NOT NULL ,
    created_at  TIMESTAMP WITHOUT TIME ZONE,
    updated_at  TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_pre_order_enrollments PRIMARY KEY (id),
    CONSTRAINT uq_payment_id UNIQUE (payment_id)

);

ALTER TABLE pre_order_enrollments ADD CONSTRAINT fk_pre_order_enrollments_course FOREIGN KEY (course_id) REFERENCES courses(id);
ALTER TABLE pre_order_enrollments ADD CONSTRAINT fk_pre_order_enrollments_user FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE pre_order_enrollments ADD CONSTRAINT fk_pre_order_enrollments_course_group FOREIGN KEY (course_group_id) REFERENCES course_groups(id);
