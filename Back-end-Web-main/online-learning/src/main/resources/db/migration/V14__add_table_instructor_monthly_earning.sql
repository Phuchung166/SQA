CREATE SEQUENCE IF NOT EXISTS instructor_monthly_earning_id_seq START WITH 1 INCREMENT BY 1;


DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'earning_status') THEN
            CREATE TYPE earning_status AS ENUM ('PENDING', 'PAID');
        END IF;
    END
$$;



CREATE TABLE IF NOT EXISTS instructor_monthly_earnings (
    id BIGINT NOT NULL ,
    instructor_id BIGINT NOT NULL,
    year INT NOT NULL,
    month INT NOT NULL,
    total_earning DECIMAL(12,0) NOT NULL DEFAULT 0,
    payment_status earning_status NOT NULL DEFAULT 'PENDING',
    paid_at TIMESTAMP WITHOUT TIME ZONE,
    created_at  TIMESTAMP WITHOUT TIME ZONE,
    updated_at  TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_instructor_monthly_earnings PRIMARY KEY (id),
    CONSTRAINT uq_instructor_year_month UNIQUE (instructor_id, year, month)
);