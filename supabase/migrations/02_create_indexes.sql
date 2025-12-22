-- ============================================
-- Step 2: Create Indexes for Performance
-- ============================================

-- Organizers indexes
CREATE INDEX IF NOT EXISTS idx_organizers_auth_user_id ON organizers(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_organizers_email ON organizers(email);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);

-- Gates indexes
CREATE INDEX IF NOT EXISTS idx_gates_event_id ON gates(event_id);
CREATE INDEX IF NOT EXISTS idx_gates_access_code ON gates(access_code);

-- Guests indexes
CREATE INDEX IF NOT EXISTS idx_guests_event_id ON guests(event_id);
CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);
CREATE INDEX IF NOT EXISTS idx_guests_rsvp_status ON guests(rsvp_status);
CREATE INDEX IF NOT EXISTS idx_guests_checked_in ON guests(checked_in);

-- Scans indexes
CREATE INDEX IF NOT EXISTS idx_scans_guest_id ON scans(guest_id);
CREATE INDEX IF NOT EXISTS idx_scans_gate_id ON scans(gate_id);
CREATE INDEX IF NOT EXISTS idx_scans_event_id ON scans(event_id);
CREATE INDEX IF NOT EXISTS idx_scans_timestamp ON scans(timestamp);
