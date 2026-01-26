ALTER TABLE courses
    ALTER COLUMN course_code SET NOT NULL;

ALTER TABLE courses
    ADD CONSTRAINT unique_course_code UNIQUE (course_code);