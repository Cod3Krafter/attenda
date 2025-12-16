-- ============================================
-- Attenda Database Schema for Supabase
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. ORGANIZERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS organizers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'staff')) DEFAULT 'staff',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Index for faster lookups
CREATE INDEX idx_organizers_auth_user_id ON organizers(auth_user_id);
CREATE INDEX idx_organizers_email ON organizers(email);

-- ============================================
-- 2. EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID NOT NULL REFERENCES organizers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    venue VARCHAR(255) NOT NULL,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'published', 'cancelled', 'completed')) DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_events_organizer_id ON events(organizer_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_date ON events(start_date);

-- ============================================
-- 3. GATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS gates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    access_code VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_gates_event_id ON gates(event_id);
CREATE INDEX idx_gates_access_code ON gates(access_code);

-- ============================================
-- 4. GUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    rsvp_status VARCHAR(20) NOT NULL CHECK (rsvp_status IN ('yes', 'no', 'pending')) DEFAULT 'pending',
    rsvp_at TIMESTAMPTZ,
    checked_in BOOLEAN NOT NULL DEFAULT false,
    checked_out BOOLEAN NOT NULL DEFAULT false,
    checked_in_at TIMESTAMPTZ,
    checked_out_at TIMESTAMPTZ,
    qr_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_guests_event_id ON guests(event_id);
CREATE INDEX idx_guests_email ON guests(email);
CREATE INDEX idx_guests_rsvp_status ON guests(rsvp_status);
CREATE INDEX idx_guests_checked_in ON guests(checked_in);

-- ============================================
-- 5. SCANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    gate_id UUID NOT NULL REFERENCES gates(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    result VARCHAR(20) NOT NULL CHECK (result IN ('success', 'denied', 'invalid')),
    scan_data TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_scans_guest_id ON scans(guest_id);
CREATE INDEX idx_scans_gate_id ON scans(gate_id);
CREATE INDEX idx_scans_event_id ON scans(event_id);
CREATE INDEX idx_scans_timestamp ON scans(timestamp);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for each table
CREATE TRIGGER update_organizers_updated_at BEFORE UPDATE ON organizers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gates_updated_at BEFORE UPDATE ON gates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gates ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ORGANIZERS POLICIES
-- ============================================

-- Users can read their own organizer profile
CREATE POLICY "Users can read own organizer profile"
    ON organizers FOR SELECT
    USING (auth.uid() = auth_user_id);

-- Users can update their own organizer profile
CREATE POLICY "Users can update own organizer profile"
    ON organizers FOR UPDATE
    USING (auth.uid() = auth_user_id);

-- Users can insert their own organizer profile (for signup)
CREATE POLICY "Users can insert own organizer profile"
    ON organizers FOR INSERT
    WITH CHECK (auth.uid() = auth_user_id);

-- ============================================
-- EVENTS POLICIES
-- ============================================

-- Organizers can read their own events
CREATE POLICY "Organizers can read own events"
    ON events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM organizers
            WHERE organizers.id = events.organizer_id
            AND organizers.auth_user_id = auth.uid()
        )
    );

-- Organizers can create events
CREATE POLICY "Organizers can create events"
    ON events FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM organizers
            WHERE organizers.id = events.organizer_id
            AND organizers.auth_user_id = auth.uid()
        )
    );

-- Organizers can update their own events
CREATE POLICY "Organizers can update own events"
    ON events FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM organizers
            WHERE organizers.id = events.organizer_id
            AND organizers.auth_user_id = auth.uid()
        )
    );

-- Organizers can delete their own events
CREATE POLICY "Organizers can delete own events"
    ON events FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM organizers
            WHERE organizers.id = events.organizer_id
            AND organizers.auth_user_id = auth.uid()
        )
    );

-- ============================================
-- GATES POLICIES
-- ============================================

-- Organizers can manage gates for their events
CREATE POLICY "Organizers can read gates for own events"
    ON gates FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM events
            JOIN organizers ON organizers.id = events.organizer_id
            WHERE events.id = gates.event_id
            AND organizers.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Organizers can insert gates for own events"
    ON gates FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM events
            JOIN organizers ON organizers.id = events.organizer_id
            WHERE events.id = gates.event_id
            AND organizers.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Organizers can update gates for own events"
    ON gates FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM events
            JOIN organizers ON organizers.id = events.organizer_id
            WHERE events.id = gates.event_id
            AND organizers.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Organizers can delete gates for own events"
    ON gates FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM events
            JOIN organizers ON organizers.id = events.organizer_id
            WHERE events.id = gates.event_id
            AND organizers.auth_user_id = auth.uid()
        )
    );

-- ============================================
-- GUESTS POLICIES
-- ============================================

-- Organizers can manage guests for their events
CREATE POLICY "Organizers can read guests for own events"
    ON guests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM events
            JOIN organizers ON organizers.id = events.organizer_id
            WHERE events.id = guests.event_id
            AND organizers.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Organizers can insert guests for own events"
    ON guests FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM events
            JOIN organizers ON organizers.id = events.organizer_id
            WHERE events.id = guests.event_id
            AND organizers.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Organizers can update guests for own events"
    ON guests FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM events
            JOIN organizers ON organizers.id = events.organizer_id
            WHERE events.id = guests.event_id
            AND organizers.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Organizers can delete guests for own events"
    ON guests FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM events
            JOIN organizers ON organizers.id = events.organizer_id
            WHERE events.id = guests.event_id
            AND organizers.auth_user_id = auth.uid()
        )
    );

-- Guests can read their own guest record (for RSVP page)
CREATE POLICY "Guests can read own guest record"
    ON guests FOR SELECT
    USING (true); -- Public read for now, can be restricted with JWT

-- Guests can update their own RSVP
CREATE POLICY "Guests can update own RSVP"
    ON guests FOR UPDATE
    USING (true); -- Public update for now, can be restricted

-- ============================================
-- SCANS POLICIES
-- ============================================

-- Organizers can read scans for their events
CREATE POLICY "Organizers can read scans for own events"
    ON scans FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM events
            JOIN organizers ON organizers.id = events.organizer_id
            WHERE events.id = scans.event_id
            AND organizers.auth_user_id = auth.uid()
        )
    );

-- Organizers can create scans for their events
CREATE POLICY "Organizers can create scans for own events"
    ON scans FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM events
            JOIN organizers ON organizers.id = events.organizer_id
            WHERE events.id = scans.event_id
            AND organizers.auth_user_id = auth.uid()
        )
    );

-- ============================================
-- HELPFUL VIEWS (Optional)
-- ============================================

-- View for event statistics
CREATE OR REPLACE VIEW event_statistics AS
SELECT
    e.id as event_id,
    e.title,
    e.organizer_id,
    COUNT(DISTINCT g.id) as total_guests,
    COUNT(DISTINCT CASE WHEN g.rsvp_status = 'yes' THEN g.id END) as rsvp_yes,
    COUNT(DISTINCT CASE WHEN g.checked_in = true THEN g.id END) as checked_in,
    COUNT(DISTINCT gt.id) as total_gates,
    COUNT(DISTINCT s.id) as total_scans
FROM events e
LEFT JOIN guests g ON g.event_id = e.id
LEFT JOIN gates gt ON gt.event_id = e.id
LEFT JOIN scans s ON s.event_id = e.id
GROUP BY e.id, e.title, e.organizer_id;

-- Grant access to the view
GRANT SELECT ON event_statistics TO authenticated;
