# Attenda API Testing Guide (Postman)

## Prerequisites

1. **Apply Database Migration**
   - Open Supabase Dashboard → SQL Editor
   - Run the migration: `supabase/migrations/20251217_create_gate_sessions.sql`
   - This creates the `gate_sessions` table

2. **Environment Variables**
   - Ensure `.env.local` has `GATE_SESSION_JWT_SECRET` set
   - Start dev server: `pnpm dev`

3. **Import to Postman**
   - Import collection: `postman/Attenda_API.postman_collection.json`
   - Import environment: `postman/Attenda_Local.postman_environment.json`
   - Select "Attenda - Local" environment in Postman

---

## Complete Testing Flow

### 1️⃣ Organizer Authentication

**Request:** `Sign Up` or `Sign In`

```json
POST /api/auth/signup
{
  "email": "organizer@example.com",
  "password": "SecurePass123",
  "name": "John Doe",
  "role": "owner"
}
```

**Auto-Saved:**
- `accessToken` - Used for all organizer operations
- `organizerId` - Your organizer ID
- `authUserId` - Supabase auth user ID

---

### 2️⃣ Create Event

**Request:** `Create Event`

```json
POST /api/events
Authorization: Bearer {{accessToken}}
{
  "organizerId": "{{organizerId}}",
  "title": "Tech Conference 2025",
  "description": "Annual technology conference",
  "venue": "Convention Center",
  "startDate": "2025-06-01T09:00:00Z",
  "endDate": "2025-06-03T18:00:00Z"
}
```

**Auto-Saved:**
- `eventId` - Your event ID

---

### 3️⃣ Create Gate

**Request:** `Create Gate (Auto-Generate Code)`

```json
POST /api/events/{{eventId}}/gates
{
  "name": "Main Entrance"
}
```

**Auto-Saved:**
- `gateId` - Gate ID
- `accessCode` - 6-character gate access code (e.g., "A3X9K2")

**⚠️ Important:** Save the `accessCode` - you'll need it for gate authentication!

---

### 4️⃣ Add Guest

**Request:** `Add Guest to Event`

```json
POST /api/events/{{eventId}}/guests
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890"
}
```

**Auto-Saved:**
- `guestId` - Guest ID for scanning

---

### 5️⃣ 🔐 Gate Authentication (NEW!)

**Request:** `🔐 Gate Authentication`

```json
POST /api/gates/auth
Authorization: Bearer {{accessToken}}
{
  "eventId": "{{eventId}}",
  "gateId": "{{gateId}}",
  "accessCode": "{{accessCode}}"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "gateSessionToken": "eyJhbGci...",
    "expiresAt": "2025-12-17T22:00:00Z",
    "expiresIn": 14400,
    "gate": {
      "id": "...",
      "name": "Main Entrance",
      "eventId": "..."
    }
  }
}
```

**Auto-Saved:**
- `gateSessionToken` - 4-hour JWT token for scanning

**Security Notes:**
- Token expires in 4 hours (non-refreshable)
- Only one session per gate (new auth invalidates previous)
- Token contains: gateId, eventId, operatorId (cannot be spoofed)

---

### 6️⃣ 🎫 Scan Guest (Secure)

**Request:** `🎫 Scan Guest (Secure)`

```json
POST /api/scan
Authorization: Bearer {{gateSessionToken}}
{
  "guestId": "{{guestId}}",
  "scanData": "QR_CODE_DATA_123"
}
```

**⚠️ BREAKING CHANGE:**
- **OLD:** Request body included `gateId` and `eventId` (user-provided)
- **NEW:** gateId and eventId extracted from JWT token (secure)

**Response:**
```json
{
  "success": true,
  "data": {
    "scan": {
      "id": "...",
      "result": "success",
      "timestamp": "2025-12-17T14:30:00Z"
    },
    "guest": {
      "id": "...",
      "name": "Jane Smith",
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

**Auto-Logged:**
- Guest name, gate name, result, timestamp
- Check-in status

---

## Testing Workflow Summary

```
1. Sign Up/Sign In          → Get accessToken
2. Create Event             → Get eventId
3. Create Gate              → Get gateId + accessCode
4. Add Guest                → Get guestId
5. 🔐 Authenticate Gate     → Get gateSessionToken
6. 🎫 Scan Guest            → Uses gateSessionToken
```

---

## Error Scenarios to Test

### 1. Scan Without Authentication

**Request:** Try scanning without gate authentication

```bash
# Skip step 5, go directly to step 6
# Expected: 401 Unauthorized
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "message": "Valid gate session token required. Please authenticate via POST /api/gates/auth",
    "code": "AUTH_REQUIRED"
  }
}
```

### 2. Invalid Access Code

**Request:** Use wrong access code in gate auth

```json
POST /api/gates/auth
{
  "eventId": "{{eventId}}",
  "gateId": "{{gateId}}",
  "accessCode": "WRONG123"
}
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "message": "Invalid gate access code",
    "code": "INVALID_ACCESS_CODE"
  }
}
```

### 3. Expired Token

**Request:** Wait 4 hours, then try scanning

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "message": "Valid gate session token required. Please authenticate via POST /api/gates/auth",
    "code": "AUTH_REQUIRED"
  }
}
```

**Solution:** Re-authenticate via `🔐 Gate Authentication`

### 4. Inactive Gate

**Request:** Deactivate gate, then try to authenticate

```bash
1. POST /api/gates/{{gateId}}/deactivate
2. POST /api/gates/auth (with that gate)
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "message": "Gate is not active",
    "code": "GATE_INACTIVE"
  }
}
```

---

## Environment Variables Reference

After running the full flow, your environment should have:

| Variable | Description | Example |
|----------|-------------|---------|
| `accessToken` | Organizer access token | `eyJhbGci...` |
| `organizerId` | Organizer UUID | `550e8400-e29b-41d4-a716-446655440000` |
| `authUserId` | Supabase auth user ID | `550e8400-e29b-41d4-a716-446655440001` |
| `eventId` | Event UUID | `550e8400-e29b-41d4-a716-446655440002` |
| `gateId` | Gate UUID | `550e8400-e29b-41d4-a716-446655440003` |
| `accessCode` | Gate access code | `A3X9K2` |
| `gateSessionToken` | Gate session JWT | `eyJhbGci...` |
| `guestId` | Guest UUID | `550e8400-e29b-41d4-a716-446655440004` |

---

## Additional Testing

### Multiple Sessions Per Gate

**Test:** Authenticate twice with same gate

```bash
1. POST /api/gates/auth → Get token1
2. POST /api/gates/auth → Get token2
3. Try scanning with token1 → Should work (token is still valid)
```

**Note:** The database enforces one session per gate via UNIQUE constraint, but old tokens remain valid until expiry. This is by design - the session in the database is for tracking, not validation. JWT expiry handles token invalidation.

### Session Cleanup

**Request:** List gate sessions (requires database query)

```sql
-- Via Supabase SQL Editor
SELECT * FROM gate_sessions WHERE gate_id = '{{gateId}}';
```

### Token Inspection

Decode the JWT token at [jwt.io](https://jwt.io) to inspect:

```json
{
  "type": "gate_session",
  "gateId": "550e8400-e29b-41d4-a716-446655440003",
  "eventId": "550e8400-e29b-41d4-a716-446655440002",
  "operatorId": "550e8400-e29b-41d4-a716-446655440000",
  "iat": 1734458400,
  "exp": 1734472800
}
```

---

## Troubleshooting

### Issue: "GATE_SESSION_JWT_SECRET environment variable is not set"

**Solution:**
1. Add to `.env.local`:
   ```env
   GATE_SESSION_JWT_SECRET=your-super-secret-key-change-this-in-production-min-32-chars
   ```
2. Restart dev server: `pnpm dev`

### Issue: Environment variables not auto-saving

**Solution:**
1. Check Postman console for errors
2. Ensure environment is selected (top-right dropdown)
3. Verify request returns 200/201 status
4. Check Test script in request

### Issue: 401 on authenticated endpoints

**Solution:**
1. Ensure you've signed in (have `accessToken`)
2. Check token hasn't expired
3. For scanning: Ensure you've completed gate authentication

---

## Next Steps

After successful testing:

1. ✅ Test complete authentication flow
2. ✅ Test error scenarios
3. 🔄 Implement session cleanup cron job
4. 🔄 Add session revocation endpoint
5. 🔄 Add gate session monitoring dashboard

---

## Support

For issues:
- Check server logs: `pnpm dev` console
- Check Postman console: View → Show Postman Console
- Verify database migration applied
- Check `.env.local` has JWT secret
