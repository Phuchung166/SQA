CREATE SEQUENCE IF NOT EXISTS category_id_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE IF NOT EXISTS course_id_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE IF NOT EXISTS course_group_id_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE IF NOT EXISTS course_module_id_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE IF NOT EXISTS user_id_seq START WITH 1 INCREMENT BY 1;

CREATE SEQUENCE IF NOT EXISTS lesson_id_seq START WITH 1 INCREMENT BY 1;


-- create some enum type

DO $$
   BEGIN
       IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'level') THEN
              CREATE TYPE level AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
       END IF;

       IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'currency') THEN
           CREATE TYPE currency AS ENUM ('USD', 'VND');
       END IF;

       IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_name') THEN
           CREATE TYPE role_name AS ENUM ('ADMIN', 'STUDENT', 'INSTRUCTOR');
       END IF;

       IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_status') THEN
           CREATE TYPE course_status AS ENUM ('DRAFT', 'PUBLISHED', 'ACTIVE','DEACTIVATED');
       END IF;

       IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enrollments_type') THEN
           CREATE TYPE enrollments_type AS ENUM ('LIFETIME', 'SUBSCRIPTION');
       END IF;
   END $$;




CREATE TABLE categories
(
    id          BIGINT       NOT NULL,
    created_at  TIMESTAMP WITHOUT TIME ZONE,
    updated_at  TIMESTAMP WITHOUT TIME ZONE,
    name        VARCHAR(100) NOT NULL,
    image      TEXT,
    slug        VARCHAR(200),
    description VARCHAR(200),
    parent_id   BIGINT,
    is_active   BOOLEAN,
    CONSTRAINT pk_categories PRIMARY KEY (id)
);

ALTER TABLE categories
    ADD CONSTRAINT fk_categories_parent
        FOREIGN KEY (parent_id) REFERENCES categories(id)
            ON DELETE SET NULL
            ON UPDATE CASCADE;


CREATE TABLE course_modules
(
    id          BIGINT       NOT NULL,
    course_id   BIGINT       NOT NULL,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order  INTEGER,
    is_preview  BOOLEAN,
    created_at  TIMESTAMP WITHOUT TIME ZONE,
    updated_at  TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_course_modules PRIMARY KEY (id)
);

CREATE TABLE courses
(
    id                BIGINT       NOT NULL,
    title             VARCHAR(255) NOT NULL,
    slug              VARCHAR(255) NOT NULL,
    course_code       VARCHAR(100),
    description       TEXT,
    thumbnail         TEXT,
    preview_video     TEXT,
    level             level,
    language          VARCHAR(10),
    status            course_status DEFAULT 'DRAFT',
    what_you_learn    TEXT,
    price             DECIMAL(10, 2),
    currency          currency,
    expired_days      INTEGER,
    skill_acquired   TEXT,
    target_audiences   TEXT,
    enrollment_type   enrollments_type,
    is_free           BOOLEAN,
    instructor_id     BIGINT,
    category_id       BIGINT,
    course_group_id    BIGINT,
    created_at        TIMESTAMP WITHOUT TIME ZONE,
    updated_at        TIMESTAMP WITHOUT TIME ZONE,
    published_at      TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_courses PRIMARY KEY (id)
);

CREATE TABLE users
(
    id             BIGINT       NOT NULL,
    created_at     TIMESTAMP WITHOUT TIME ZONE,
    updated_at     TIMESTAMP WITHOUT TIME ZONE,
    email          VARCHAR(100) NOT NULL UNIQUE ,
    account_name   VARCHAR(255),
    is_active      BOOLEAN DEFAULT TRUE,
    phone          VARCHAR(255),
    password       VARCHAR(255),
    first_name     VARCHAR(255),
    last_name      VARCHAR(255),
    avatar         VARCHAR(255),
    date_of_birth  date,
    gender         VARCHAR(255),
    bio            VARCHAR(500),
    provider       VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN,
    last_login     TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_users PRIMARY KEY (id)
);
CREATE TABLE lessons
(
    id             BIGINT       NOT NULL,
    created_at     TIMESTAMP WITHOUT TIME ZONE,
    updated_at     TIMESTAMP WITHOUT TIME ZONE,
    module_id      BIGINT       NOT NULL,
    title          VARCHAR(255) NOT NULL,
    description    TEXT,
    content_type   VARCHAR(20)  NOT NULL,
    video_url      TEXT,
    duration    BIGINT,
    document_url   TEXT,
    content        TEXT,
    sort_order     INTEGER,
    is_preview     BOOLEAN,
    is_mandatory   BOOLEAN,
    CONSTRAINT pk_lessons PRIMARY KEY (id)
);


CREATE TABLE course_groups
(
    id          BIGINT       NOT NULL,
    title       VARCHAR(255) NOT NULL,
    slug        VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail   TEXT,
    enrollment_type   enrollments_type,
    price       DECIMAL(10, 2),
    custom_price DECIMAL(10,2),
    what_you_learn    TEXT,
    created_at  TIMESTAMP WITHOUT TIME ZONE,
    updated_at  TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_sub_courses PRIMARY KEY (id)
);

ALTER TABLE courses
    ADD CONSTRAINT FK_COURSES_ON_CATEGORY FOREIGN KEY (category_id) REFERENCES categories (id);

ALTER TABLE courses
    ADD CONSTRAINT FK_COURSE_ON_COURSE_GROUP FOREIGN KEY (course_group_id) REFERENCES course_groups (id);

ALTER TABLE course_modules
    ADD CONSTRAINT FK_MODULE_ON_COURSE FOREIGN KEY (course_id) REFERENCES courses (id);

ALTER TABLE lessons
    ADD CONSTRAINT FK_LESSONS_ON_MODULE FOREIGN KEY (module_id) REFERENCES course_modules (id);

