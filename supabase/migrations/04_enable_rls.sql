-- ============================================
-- Step 4: Enable Row Level Security (RLS)
-- Run this AFTER tables are created and working
-- ============================================

-- Enable RLS on all tables
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gates ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- ORGANIZERS POLICIES
CREATE POLICY "Users can read own organizer profile"
    ON organizers FOR SELECT
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own organizer profile"
    ON organizers FOR UPDATE
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert own organizer profile"
    ON organizers FOR INSERT
    WITH CHECK (auth.uid() = auth_user_id);

-- EVENTS POLICIES
CREATE POLICY "Organizers can read own events"
    ON events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM organizers
            WHERE organizers.id = events.organizer_id
            AND organizers.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Organizers can create events"
    ON events FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM organizers
            WHERE organizers.id = events.organizer_id
            AND organizers.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Organizers can update own events"
    ON events FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM organizers
            WHERE organizers.id = events.organizer_id
            AND organizers.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Organizers can delete own events"
    ON events FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM organizers
            WHERE organizers.id = events.organizer_id
            AND organizers.auth_user_id = auth.uid()
        )
    );

-- GATES POLICIES
CREATE POLICY "Organizers can manage gates for own events"
    ON gates FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM events
            JOIN organizers ON organizers.id = events.organizer_id
            WHERE events.id = gates.event_id
            AND organizers.auth_user_id = auth.uid()
        )
    );

-- GUESTS POLICIES
CREATE POLICY "Organizers can manage guests for own events"
    ON guests FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM events
            JOIN organizers ON organizers.id = events.organizer_id
            WHERE events.id = guests.event_id
            AND organizers.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Guests can read own guest record"
    ON guests FOR SELECT
    USING (true);

-- SCANS POLICIES
CREATE POLICY "Organizers can manage scans for own events"
    ON scans FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM events
            JOIN organizers ON organizers.id = events.organizer_id
            WHERE events.id = scans.event_id
            AND organizers.auth_user_id = auth.uid()
        )
    );
