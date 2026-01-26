CREATE SEQUENCE IF NOT EXISTS file_upload_id_seq START WITH 1 INCREMENT BY 1;


CREATE TABLE file_upload
(
    id          BIGINT       NOT NULL,
    created_at  TIMESTAMP WITHOUT TIME ZONE,
    updated_at  TIMESTAMP WITHOUT TIME ZONE,
    s3_key   VARCHAR(255) NOT NULL,
    lesson_id   BIGINT,
    upload_id   VARCHAR(100),
    total_parts   INTEGER,
    CONSTRAINT pk_file_upload PRIMARY KEY (id)
);

ALTER TABLE file_upload
    ADD CONSTRAINT fk_file_upload_lesson
        FOREIGN KEY (lesson_id)
            REFERENCES lessons (id);

DO $$
    BEGIN
        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'order_items'
              AND column_name = 'price'
        ) THEN
            ALTER TABLE order_items DROP COLUMN price;
        END IF;

        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'order_items'
              AND column_name = 'discount_amount'
        ) THEN
            ALTER TABLE order_items DROP COLUMN discount_amount;
        END IF;

        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'order_items'
              AND column_name = 'final_price'
        ) THEN
            ALTER TABLE order_items DROP COLUMN final_price;
        END IF;

        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'instructors'
              AND column_name = 'total_courses'
        ) THEN
            ALTER TABLE instructors DROP COLUMN total_courses;
        END IF;

        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'instructors'
              AND column_name = 'total_students'
        ) THEN
            ALTER TABLE instructors DROP COLUMN total_students;
        END IF;
    END $$;

CREATE SEQUENCE IF NOT EXISTS cart_item_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE cart_items
(
    id          BIGINT       NOT NULL,
    user_id     BIGINT       NOT NULL,
    course_id   BIGINT,
    course_group_id BIGINT,
    quantity    INT  DEFAULT 1,
    created_at  TIMESTAMP WITHOUT TIME ZONE,
    updated_at  TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_cart_items PRIMARY KEY (id)
);


ALTER TABLE cart_items
    ADD CONSTRAINT fk_cart_items_user FOREIGN KEY (user_id) REFERENCES users (id);
ALTER TABLE cart_items
    ADD CONSTRAINT fk_cart_items_course FOREIGN KEY (course_id) REFERENCES courses (id);

ALTER TABLE cart_items
    ADD CONSTRAINT fk_cart_items_course_group FOREIGN KEY (course_group_id) REFERENCES course_groups(id);