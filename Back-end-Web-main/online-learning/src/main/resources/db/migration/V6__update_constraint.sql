DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uc_6c8d6aa5e27c938c0b7ce5c28'
    ) THEN
       ALTER TABLE enrollments DROP CONSTRAINT uc_6c8d6aa5e27c938c0b7ce5c28;
END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uc_b9cf3964b3240ca600d5f2b68'
    ) THEN
       ALTER TABLE reviews DROP CONSTRAINT uc_b9cf3964b3240ca600d5f2b68;
END IF;
END $$;
