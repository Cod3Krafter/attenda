-- Create gate_sessions table for tracking active gate authentication sessions
CREATE TABLE gate_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gate_id UUID NOT NULL REFERENCES gates(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES organizers(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL, -- SHA-256 hash of the JWT token
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by gate_id (to enforce one session per gate)
CREATE UNIQUE INDEX idx_gate_sessions_gate_id ON gate_sessions(gate_id);

-- Index for cleanup of expired sessions
CREATE INDEX idx_gate_sessions_expires_at ON gate_sessions(expires_at);

-- Add RLS (Row Level Security)
ALTER TABLE gate_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Organizers can only see sessions for their events
CREATE POLICY gate_sessions_select_policy ON gate_sessions
    FOR SELECT
    USING (
        event_id IN (
            SELECT id FROM events
            WHERE organizer_id = auth.uid()::uuid
        )
    );

-- Policy: System can insert sessions (handled by server-side code)
CREATE POLICY gate_sessions_insert_policy ON gate_sessions
    FOR INSERT
    WITH CHECK (true);

-- Policy: System can delete sessions
CREATE POLICY gate_sessions_delete_policy ON gate_sessions
    FOR DELETE
    USING (true);

-- Comment
COMMENT ON TABLE gate_sessions IS 'Tracks active gate operator authentication sessions. Only one session allowed per gate at a time.';
