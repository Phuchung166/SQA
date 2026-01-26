DO $$
    BEGIN
        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'orders'
              AND column_name = 'vnp_txn_ref'
        ) THEN
            ALTER TABLE orders DROP COLUMN vnp_txn_ref;
        END IF;
    END
$$;


DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'order_number_unique'
        ) THEN
            ALTER TABLE orders
                ADD CONSTRAINT order_number_unique UNIQUE (order_number);
        END IF;
    END
$$;
