-- Migration script to add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS matricule VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS centre VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS sexe VARCHAR(50);
