-- Make operator_id nullable for anonymous gate operators
-- This allows gate authentication without requiring organizer accounts

-- Drop the existing foreign key constraint
ALTER TABLE gate_sessions
DROP CONSTRAINT IF EXISTS gate_sessions_operator_id_fkey;

-- Make operator_id nullable
ALTER TABLE gate_sessions
ALTER COLUMN operator_id DROP NOT NULL;

-- Add back foreign key constraint (now allows NULL)
ALTER TABLE gate_sessions
ADD CONSTRAINT gate_sessions_operator_id_fkey
FOREIGN KEY (operator_id)
REFERENCES organizers(id)
ON DELETE SET NULL;

-- Update comment
COMMENT ON COLUMN gate_sessions.operator_id IS 'ID of organizer who authenticated (NULL for anonymous gate operators)';
