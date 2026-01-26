-- Rename column "order" to "sort_order" in the "options" table
ALTER TABLE options RENAME COLUMN "order" TO sort_order;


-- Add new column is_mandatory to the quizzes table
ALTER TABLE quizzes ADD COLUMN is_mandatory BOOLEAN DEFAULT FALSE;