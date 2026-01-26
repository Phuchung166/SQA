-- Add pre-order related columns to course_groups table
ALTER TABLE course_groups ADD COLUMN IF NOT EXISTS is_pre_order BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE course_groups ADD COLUMN IF NOT EXISTS bundle_preorder_start_date TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE course_groups ADD COLUMN IF NOT EXISTS bundle_preorder_end_date TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE course_groups ADD COLUMN IF NOT EXISTS pre_order_price DECIMAL(12,0);
ALTER TABLE course_groups ADD COLUMN IF NOT EXISTS bundle_total_slots INT;
ALTER TABLE course_groups ADD COLUMN IF NOT EXISTS bundle_remaining_slots INT;

