ALTER TABLE activities ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS participation_amounts JSONB DEFAULT '[]';

ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_amount INTEGER;
