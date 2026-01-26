DO $$
    BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'lesson_progress'
          AND column_name = 'is_done'
    ) THEN
    ALTER TABLE lesson_progress DROP COLUMN is_done;
    END IF;
END $$;