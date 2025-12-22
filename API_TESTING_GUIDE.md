# Attenda API Testing Guide

## Prerequisites

### 1. Environment Setup
Ensure your `.env.local` file exists with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Start Development Server
```bash
pnpm dev
```

Server should start at: `http://localhost:3000`

---

## Testing Workflow

### Step 1: Authentication

#### 1.1 Sign Up (Create Organizer)
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "name": "Test Organizer",
    "role": "owner"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "test@example.com" },
    "organizer": { "id": "...", "name": "Test Organizer", "role": "owner" },
    "session": { "access_token": "...", "refresh_token": "..." }
  }
}
```

**Save the `access_token` for subsequent requests!**

#### 1.2 Sign In
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

#### 1.3 Get Current Session
```bash
curl http://localhost:3000/api/auth/session \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### Step 2: Event Management

#### 2.1 Create Event
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "organizerId": "YOUR_ORGANIZER_ID",
    "title": "Tech Conference 2025",
    "description": "Annual tech event",
    "venue": "Convention Center",
    "startDate": "2025-06-01T09:00:00Z",
    "endDate": "2025-06-03T18:00:00Z"
  }'
```

**Save the event `id` from response!**

#### 2.2 List Events for Organizer
```bash
curl "http://localhost:3000/api/events?organizerId=YOUR_ORGANIZER_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 2.3 Get Event by ID
```bash
curl http://localhost:3000/api/events/EVENT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 2.4 Publish Event
```bash
curl -X POST http://localhost:3000/api/events/EVENT_ID/publish \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### Step 3: Guest Management

#### 3.1 Add Guest to Event
```bash
curl -X POST http://localhost:3000/api/events/EVENT_ID/guests \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }'
```

**Save the guest `id` from response!**

#### 3.2 List Guests for Event
```bash
curl http://localhost:3000/api/events/EVENT_ID/guests
```

#### 3.3 Update Guest RSVP
```bash
curl -X POST http://localhost:3000/api/guests/GUEST_ID/rsvp \
  -H "Content-Type: application/json" \
  -d '{
    "status": "yes"
  }'
```

---

### Step 4: Gate Management

#### 4.1 Create Gate (Auto-Generate Access Code)
```bash
curl -X POST http://localhost:3000/api/events/EVENT_ID/gates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Entrance"
  }'
```

**Note the auto-generated `accessCode` in response!**

#### 4.2 Create Gate (Custom Access Code)
```bash
curl -X POST http://localhost:3000/api/events/EVENT_ID/gates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "VIP Entrance",
    "accessCode": "VIP2025"
  }'
```

**Save the gate `id` from response!**

#### 4.3 List Gates for Event
```bash
curl http://localhost:3000/api/events/EVENT_ID/gates
```

#### 4.4 Regenerate Access Code
```bash
curl -X POST http://localhost:3000/api/gates/GATE_ID/regenerate-code
```

---

### Step 5: Scanning (QR Code Check-In)

#### 5.1 Record Scan (Check In Guest)
```bash
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "guestId": "GUEST_ID",
    "gateId": "GATE_ID",
    "eventId": "EVENT_ID",
    "scanData": "QR_CODE_DATA_123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "scan": {
      "id": "...",
      "result": "success",
      "timestamp": "2025-12-16T..."
    },
    "guest": {
      "id": "...",
      "name": "John Doe",
      "rsvpStatus": "yes",
      "checkedIn": true
    },
    "gate": {
      "id": "...",
      "name": "Main Entrance"
    }
  }
}
```

#### 5.2 Get Scan History for Event
```bash
curl http://localhost:3000/api/events/EVENT_ID/scans
```

#### 5.3 Get Scan History for Guest
```bash
curl http://localhost:3000/api/guests/GUEST_ID/scans
```

---

## Test Scenarios

### Scenario 1: Happy Path
1. ✅ Sign up new organizer
2. ✅ Create event
3. ✅ Publish event
4. ✅ Add guests
5. ✅ Create gates
6. ✅ Guests RSVP "yes"
7. ✅ Scan guests at gate (auto check-in)
8. ✅ Verify scan history

### Scenario 2: Error Handling
1. ❌ Sign up with existing email → 409 Conflict
2. ❌ Sign in with wrong password → 401 Unauthorized
3. ❌ Create event with invalid organizerId → 404 Not Found
4. ❌ Create gate with duplicate accessCode → 409 Conflict
5. ❌ Scan guest at inactive gate → Result: "denied"
6. ❌ Scan guest who RSVP'd "no" → Result: "denied"

### Scenario 3: Validation
1. ❌ Create event without required fields → 400 Bad Request
2. ❌ Update RSVP with invalid status → 400 Bad Request
3. ❌ Check out guest who hasn't checked in → Error

---

## Quick Test Script

See `scripts/test-api.sh` for automated testing script.

---

## Common Issues

### Issue 1: "Unauthorized" errors
- Make sure you're including the `Authorization: Bearer TOKEN` header
- Token expires after some time - sign in again to get a new one

### Issue 2: "Organizer not found"
- Use the correct `organizerId` from signup response
- Check Supabase database to verify organizer was created

### Issue 3: "Event not found"
- Make sure event was created successfully
- Check event ID in response

### Issue 4: Scan result is "denied"
- Verify gate is active
- Check guest RSVP status (should be "yes" or "pending")
- Ensure guest belongs to the event
- Verify gate belongs to the event

---

## Next Steps After Testing

1. ✅ Verify all core flows work
2. 🚀 Build UI components
3. 📋 Add bulk guest upload
4. 🔒 Add authentication middleware
5. 📊 Add analytics endpoints

