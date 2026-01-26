
-- remove columns and create enum type if not exists
DO $$
    BEGIN
        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'orders'
              AND column_name = 'notes'
        ) THEN
            ALTER TABLE orders DROP COLUMN notes;
        END IF;

        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'orders'
              AND column_name = 'total_amount'
        ) THEN
            ALTER TABLE orders DROP COLUMN total_amount;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
            CREATE TYPE payment_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'EXPIRED', 'CANCELLED', 'REFUND_REQUESTED', 'REFUND_SUCCESS', 'REFUND_FAILED');
        END IF;
    END
$$;

-- add columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_money DECIMAL(12,0) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW();
ALTER TABLE orders ADD COLUMN IF NOT EXISTS vnp_txn_ref VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status payment_status NOT NULL DEFAULT 'PENDING';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency public.currency NOT NULL DEFAULT 'VND'::public.currency;