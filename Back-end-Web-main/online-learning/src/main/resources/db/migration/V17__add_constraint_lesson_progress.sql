DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1
            FROM pg_constraint
            WHERE conname = 'uk_lesson_progress_user_lesson_enrollment'
              AND conrelid = 'lesson_progress'::regclass
        ) THEN
            ALTER TABLE lesson_progress
                ADD CONSTRAINT uk_lesson_progress_user_lesson_enrollment
                    UNIQUE (user_id, lesson_id, enrollment_id);
        END IF;
    END
$$;
