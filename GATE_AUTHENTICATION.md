# Gate Authentication System

## Overview

The Gate Authentication system provides secure, time-limited access control for gate operators to scan guests at events. It uses JWT tokens to ensure only authorized operators can perform scans at specific gates.

## Key Features

✅ **Secure Authentication** - Requires organizer credentials + gate access code
✅ **Time-Limited Sessions** - 4-hour token expiry (non-refreshable)
✅ **One Session Per Gate** - New authentication invalidates previous session
✅ **Operator Tracking** - Records which organizer authenticated
✅ **Token-Based Scanning** - Gate/Event IDs extracted from JWT (cannot be spoofed)

---

## Architecture

### Components

1. **JWT Utilities** (`src/lib/gateAuth.ts`)
   - Token generation with HS256 algorithm
   - Token validation and verification
   - Session extraction from requests

2. **Gate Session Entity** (`src/core/entities/gateSession/GateSession.ts`)
   - Tracks active gate sessions
   - Stores token hash (SHA-256)
   - Validates expiry

3. **Gate Session Repository** (`src/infrastructure/repositories/SupabaseGateSessionRepository.ts`)
   - Manages session persistence
   - Enforces one session per gate
   - Cleanup of expired sessions

4. **Gate Auth Endpoint** (`src/app/api/gates/auth/route.ts`)
   - Authenticates gate operators
   - Issues JWT tokens
   - Manages session creation

5. **Secure Scan Endpoint** (`src/app/api/scan/route.ts`)
   - Validates gate session tokens
   - Extracts gate/event context from token
   - Performs secure scanning

---

## Authentication Flow

### Phase 1: Gate Operator Authentication

```
┌─────────────┐
│  Organizer  │
│  (Operator) │
└──────┬──────┘
       │
       │ 1. Sign in as organizer
       ▼
┌─────────────────────┐
│  POST /api/auth     │
│  /signin            │
└──────┬──────────────┘
       │
       │ 2. Receives access token
       ▼
┌─────────────────────┐
│  Organizer gets:    │
│  - Access token     │
│  - Gate access code │
│    (from organizer) │
└──────┬──────────────┘
       │
       │ 3. Authenticate to gate
       ▼
┌─────────────────────┐
│  POST /api/gates    │
│  /auth              │
└──────┬──────────────┘
       │
       │ 4. Validation:
       │    ✓ Organizer authenticated
       │    ✓ Gate exists
       │    ✓ Access code matches
       │    ✓ Gate is active
       │    ✓ Gate belongs to event
       ▼
┌─────────────────────┐
│  Receives:          │
│  - gateSessionToken │
│  - expiresAt        │
│  - expiresIn: 14400 │
└──────┬──────────────┘
       │
       │ 5. Token stored
       ▼
┌─────────────────────┐
│  Ready to scan!     │
└─────────────────────┘
```

### Phase 2: Scanning

```
┌─────────────┐
│   Scan      │
│  Operator   │
└──────┬──────┘
       │
       │ Guest presents QR code
       ▼
┌─────────────────────┐
│  POST /api/scan     │
│  Authorization:     │
│  Bearer <token>     │
│  Body:              │
│  {guestId, data}    │
└──────┬──────────────┘
       │
       │ Token validation:
       │  ✓ Token exists
       │  ✓ Signature valid
       │  ✓ Not expired
       │  ✓ Type = gate_session
       ▼
┌─────────────────────┐
│  Extract from token:│
│  - gateId           │
│  - eventId          │
│  - operatorId       │
└──────┬──────────────┘
       │
       │ Perform scan
       ▼
┌─────────────────────┐
│  Guest checked in   │
│  (if valid)         │
└─────────────────────┘
```

---

## API Reference

### 1. Gate Authentication

**Endpoint:** `POST /api/gates/auth`

**Purpose:** Authenticate a gate operator and obtain a session token

**Authentication:** Required (Bearer token - organizer access token)

**Request:**
```json
{
  "eventId": "uuid",
  "gateId": "uuid",
  "accessCode": "A3X9K2"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "gateSessionToken": "eyJhbGci...",
    "expiresAt": "2025-12-17T22:00:00Z",
    "expiresIn": 14400,
    "gate": {
      "id": "uuid",
      "name": "Main Entrance",
      "eventId": "uuid"
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Not signed in as organizer
- `404 Not Found` - Gate doesn't exist
- `400 Bad Request` - Gate doesn't belong to event
- `403 Forbidden` - Invalid access code or gate inactive

### 2. Scan with Gate Session

**Endpoint:** `POST /api/scan`

**Purpose:** Record a guest scan/check-in

**Authentication:** Required (Bearer token - gate session token)

**Headers:**
```
Authorization: Bearer <gateSessionToken>
```

**Request:**
```json
{
  "guestId": "uuid",
  "scanData": "QR_CODE_DATA"
}
```

**Note:** `gateId` and `eventId` are automatically extracted from the JWT token.

**Response (201):**
```json
{
  "success": true,
  "data": {
    "scan": {
      "id": "uuid",
      "result": "success",
      "timestamp": "2025-12-17T14:30:00Z"
    },
    "guest": {
      "id": "uuid",
      "name": "John Doe",
      "rsvpStatus": "yes",
      "checkedIn": true
    },
    "gate": {
      "id": "uuid",
      "name": "Main Entrance"
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid gate session token
- `400 Bad Request` - Missing guestId
- Scan-specific errors (denied, invalid, etc.)

---

## JWT Token Structure

### Payload
```json
{
  "type": "gate_session",
  "gateId": "uuid",
  "eventId": "uuid",
  "operatorId": "uuid",
  "iat": 1734458400,
  "exp": 1734472800
}
```

### Properties
- **type**: Always `"gate_session"` (for validation)
- **gateId**: ID of the gate being operated
- **eventId**: ID of the event
- **operatorId**: ID of the organizer who authenticated
- **iat**: Issued at (Unix timestamp)
- **exp**: Expires at (Unix timestamp, +4 hours)

### Security Features
- **Algorithm:** HS256 (HMAC SHA-256)
- **Secret:** `GATE_SESSION_JWT_SECRET` environment variable
- **Expiry:** 4 hours (14400 seconds)
- **Non-refreshable:** Must re-authenticate after expiry

---

## Database Schema

### `gate_sessions` Table

```sql
CREATE TABLE gate_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gate_id UUID NOT NULL REFERENCES gates(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES organizers(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enforce one session per gate
CREATE UNIQUE INDEX idx_gate_sessions_gate_id ON gate_sessions(gate_id);
```

**Key Constraints:**
- **UNIQUE gate_id**: Only one active session per gate
- **CASCADE DELETE**: Session deleted when gate/event/organizer deleted
- **token_hash**: SHA-256 hash of JWT (for validation/revocation)

---

## Security Considerations

### Token Storage
- ✅ **Token hash stored**, not plaintext
- ✅ **SHA-256** for one-way hashing
- ✅ **Indexed** for fast lookup

### One Session Per Gate
- When operator authenticates, previous session is **deleted**
- Prevents multiple simultaneous operators at same gate
- Previous tokens become **invalid immediately**

### Token Non-Refreshability
- **Why**: Security requirement
- **Impact**: Operator must contact organizer for new code after 4 hours
- **Benefit**: Forces periodic re-validation and code rotation

### Operator Tracking
- **operatorId** in JWT payload
- Audit trail of who authenticated to which gate
- Can track scanning activity per operator

### Token Validation
- ✅ Signature verification (prevents tampering)
- ✅ Expiry check (time-limited access)
- ✅ Type validation (prevents token reuse)
- ✅ Payload structure validation

---

## Environment Variables

### Required

```env
# Gate Session JWT Secret (min 32 characters)
GATE_SESSION_JWT_SECRET=your-super-secret-key-change-this-in-production-min-32-chars
```

**Important:**
- Use a strong, random secret in production
- Keep secret confidential
- Rotate periodically for security
- Never commit to version control

---

## Testing Flow

### 1. Setup
```bash
# Add to .env.local
GATE_SESSION_JWT_SECRET=your-secret-key-here

# Start server
pnpm dev

# Run database migration
# (Apply supabase/migrations/20251217_create_gate_sessions.sql)
```

### 2. Create Test Data
```bash
# 1. Sign up as organizer
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123","name":"Test Organizer","role":"owner"}'

# Save: access_token, organizer_id

# 2. Create event
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"organizerId":"<organizer_id>","title":"Test Event",...}'

# Save: event_id

# 3. Create gate
curl -X POST http://localhost:3000/api/events/<event_id>/gates \
  -H "Content-Type: application/json" \
  -d '{"name":"Main Entrance"}'

# Save: gate_id, access_code

# 4. Add guest
curl -X POST http://localhost:3000/api/events/<event_id>/guests \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'

# Save: guest_id
```

### 3. Test Gate Authentication
```bash
curl -X POST http://localhost:3000/api/gates/auth \
  -H "Authorization: Bearer <organizer_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "<event_id>",
    "gateId": "<gate_id>",
    "accessCode": "<access_code>"
  }'

# Save: gateSessionToken
```

### 4. Test Scanning
```bash
curl -X POST http://localhost:3000/api/scan \
  -H "Authorization: Bearer <gateSessionToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "guestId": "<guest_id>",
    "scanData": "QR_123"
  }'
```

---

## Error Scenarios

### Invalid Access Code
```json
{
  "success": false,
  "error": {
    "message": "Invalid gate access code",
    "code": "INVALID_ACCESS_CODE"
  }
}
```

### Inactive Gate
```json
{
  "success": false,
  "error": {
    "message": "Gate is not active",
    "code": "GATE_INACTIVE"
  }
}
```

### Expired Token
```json
{
  "success": false,
  "error": {
    "message": "Valid gate session token required. Please authenticate via POST /api/gates/auth",
    "code": "AUTH_REQUIRED"
  }
}
```

### No Authentication
```json
{
  "success": false,
  "error": {
    "message": "Authentication required. Please sign in as an organizer.",
    "code": "AUTH_REQUIRED"
  }
}
```

---

## Migration Guide

### From Old System (No Auth)

**Before:**
```javascript
POST /api/scan
{
  "guestId": "...",
  "gateId": "...",    // ❌ User-provided
  "eventId": "...",   // ❌ User-provided
  "scanData": "..."
}
```

**After:**
```javascript
// Step 1: Authenticate
POST /api/gates/auth
Authorization: Bearer <organizer_token>
{
  "eventId": "...",
  "gateId": "...",
  "accessCode": "A3X9K2"
}
→ Receives gateSessionToken

// Step 2: Scan
POST /api/scan
Authorization: Bearer <gateSessionToken>
{
  "guestId": "...",
  "scanData": "..."
}
// gateId and eventId extracted from token ✅
```

---

## Next Steps

1. ✅ Apply database migration
2. ✅ Update Postman collection
3. ✅ Test complete flow
4. 🔄 Add session cleanup cron job (delete expired sessions)
5. 🔄 Add gate session monitoring dashboard
6. 🔄 Add session revocation endpoint (for emergencies)

---

## Support

For issues or questions:
- Check server logs for detailed errors
- Verify `.env.local` has `GATE_SESSION_JWT_SECRET`
- Ensure Supabase migration was applied
- Test with Postman collection
