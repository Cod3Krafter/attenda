# Attenda E2E Test Flow (Postman)

## 🎯 Complete User Journey Test

This document outlines the complete end-to-end test flow for the Attenda event management system.

---

## 📋 Test Flow Overview

```
1. Organizer Signs Up/Signs In
2. Organizer Creates Event
3. Organizer Creates Gates (Main + VIP)
4. Organizer Adds Multiple Guests
5. Organizer Publishes Event
6. Gate Operator Authenticates (Anonymous)
7. Gate Operator Scans Multiple Guests
8. Verify Check-in Status
9. View Scan History
10. Update Event/Guest/Gate
11. Error Scenarios Testing
```

---

## 🚀 Running the Complete Flow

### Method 1: Collection Runner (Automated Sequence)

1. Open Postman → Collections → "Attenda API"
2. Click "Run" button (top right)
3. Select requests to run in sequence
4. Click "Run Attenda API"

### Method 2: Manual Step-by-Step

Follow the detailed steps below.

---

## 📝 Detailed Test Scenarios

## Scenario 1: Happy Path - Complete Event Flow

### Step 1: Organizer Authentication
**Request:** `Sign Up` or `Sign In`

**Test:**
```json
POST /api/auth/signup
{
  "email": "organizer@test.com",
  "password": "TestPass123",
  "name": "Test Organizer",
  "role": "owner"
}
```

**Expected Result:**
- ✅ Status: 201 Created
- ✅ Returns: user, organizer, session
- ✅ Auto-saves: accessToken, organizerId, authUserId

**Verify:**
- `{{accessToken}}` is set
- `{{organizerId}}` is a valid UUID

---

### Step 2: Create Event
**Request:** `Create Event`

**Test:**
```json
POST /api/events
Authorization: Bearer {{accessToken}}
{
  "organizerId": "{{organizerId}}",
  "title": "E2E Test Conference 2025",
  "description": "Full system test event",
  "venue": "Test Convention Center",
  "startDate": "2025-06-01T09:00:00Z",
  "endDate": "2025-06-03T18:00:00Z"
}
```

**Expected Result:**
- ✅ Status: 201 Created
- ✅ Event created with status: 'draft'
- ✅ Auto-saves: eventId

**Verify:**
- Event belongs to organizerId
- All fields populated correctly

---

### Step 3: Create Multiple Gates
**Request:** `Create Gate (Auto-Generate Code)`

**Test Gate 1 - Main Entrance:**
```json
POST /api/events/{{eventId}}/gates
{
  "name": "Main Entrance"
}
```

**Expected Result:**
- ✅ Status: 201 Created
- ✅ Auto-generated 6-character access code
- ✅ Gate is active by default
- ✅ Auto-saves: gateId, accessCode

**Manually save these for multi-gate testing:**
- Copy `gateId` → save as `mainGateId`
- Copy `accessCode` → save as `mainGateCode`

**Test Gate 2 - VIP Entrance:**
```json
POST /api/events/{{eventId}}/gates
{
  "name": "VIP Entrance",
  "accessCode": "VIP2025"
}
```

**Expected Result:**
- ✅ Status: 201 Created
- ✅ Custom access code: "VIP2025"
- ✅ Different gateId

**Save:**
- Copy `gateId` → save as `vipGateId`
- Copy `accessCode` → save as `vipGateCode`

---

### Step 4: Add Multiple Guests
**Request:** `Add Guest to Event`

**Test Guest 1:**
```json
POST /api/events/{{eventId}}/guests
{
  "name": "Alice Johnson",
  "email": "alice@test.com",
  "phone": "+1234567890"
}
```

**Expected Result:**
- ✅ Status: 201 Created
- ✅ Guest added to event
- ✅ Default RSVP status: "pending"
- ✅ checkedIn: false
- ✅ Auto-saves: guestId

**Save:** `aliceGuestId`

**Test Guest 2:**
```json
POST /api/events/{{eventId}}/guests
{
  "name": "Bob Smith",
  "email": "bob@test.com",
  "phone": "+1234567891"
}
```

**Save:** `bobGuestId`

**Test Guest 3:**
```json
POST /api/events/{{eventId}}/guests
{
  "name": "Charlie Davis",
  "email": "charlie@test.com",
  "phone": "+1234567892"
}
```

**Save:** `charlieGuestId`

---

### Step 5: Update RSVP Status
**Request:** `Update RSVP`

**Test:**
```json
POST /api/guests/{{aliceGuestId}}/rsvp
{
  "status": "yes"
}
```

**Expected Result:**
- ✅ Status: 200 OK
- ✅ Alice's RSVP: "yes"

**Repeat for Bob:**
```json
POST /api/guests/{{bobGuestId}}/rsvp
{
  "status": "yes"
}
```

**Leave Charlie as "pending" for testing**

---

### Step 6: Publish Event
**Request:** `Publish Event`

**Test:**
```json
POST /api/events/{{eventId}}/publish
Authorization: Bearer {{accessToken}}
```

**Expected Result:**
- ✅ Status: 200 OK
- ✅ Event status changed to: "published"

**Verify:** Event is now live

---

### Step 7: Gate Authentication (Anonymous)
**Request:** `🔓 Gate Authentication (Public)`

**Test Main Gate:**
```json
POST /api/gates/auth
{
  "gateId": "{{mainGateId}}",
  "accessCode": "{{mainGateCode}}"
}
```

**Expected Result:**
- ✅ Status: 201 Created
- ✅ Returns: gateSessionToken
- ✅ Token expires in 14400 seconds (4 hours)
- ✅ operatorId: null (anonymous)
- ✅ Auto-saves: gateSessionToken

**Verify:**
- Decode JWT at jwt.io
- Check payload contains: gateId, eventId, operatorId: null

**Save:** `mainGateToken`

**Test VIP Gate:**
```json
POST /api/gates/auth
{
  "gateId": "{{vipGateId}}",
  "accessCode": "VIP2025"
}
```

**Save:** `vipGateToken`

---

### Step 8: Scan Guests
**Request:** `🎫 Scan Guest (Secure)`

**Test Scan 1 - Alice at Main Gate:**
```json
POST /api/scan
Authorization: Bearer {{mainGateToken}}
{
  "guestId": "{{aliceGuestId}}",
  "scanData": "QR_ALICE_123"
}
```

**Expected Result:**
- ✅ Status: 201 Created
- ✅ Scan result: "success"
- ✅ Guest auto-checked in: checkedIn: true
- ✅ Scan linked to Main Entrance gate
- ✅ Timestamp recorded

**Test Scan 2 - Bob at Main Gate:**
```json
POST /api/scan
Authorization: Bearer {{mainGateToken}}
{
  "guestId": "{{bobGuestId}}",
  "scanData": "QR_BOB_456"
}
```

**Expected Result:**
- ✅ Bob checked in successfully

**Test Scan 3 - Charlie at VIP Gate:**
```json
POST /api/scan
Authorization: Bearer {{vipGateToken}}
{
  "guestId": "{{charlieGuestId}}",
  "scanData": "QR_CHARLIE_789"
}
```

**Expected Result:**
- ✅ Charlie checked in at VIP gate
- ✅ Works even though RSVP is "pending"

---

### Step 9: Verify Scan History
**Request:** `Get Event Scans`

**Test:**
```json
GET /api/events/{{eventId}}/scans
```

**Expected Result:**
- ✅ Returns 3 scans
- ✅ Shows which gate each guest used
- ✅ Timestamps in order

**Request:** `Get Gate Scan History`

**Test Main Gate:**
```json
GET /api/gates/{{mainGateId}}/scans
```

**Expected Result:**
- ✅ Shows 2 scans (Alice + Bob)

**Test VIP Gate:**
```json
GET /api/gates/{{vipGateId}}/scans
```

**Expected Result:**
- ✅ Shows 1 scan (Charlie)

**Request:** `Get Guest Scan History`

**Test:**
```json
GET /api/guests/{{aliceGuestId}}/scans
```

**Expected Result:**
- ✅ Shows Alice's scan at Main Entrance

---

### Step 10: List and Verify Data
**Request:** `List Event Guests`

**Test:**
```json
GET /api/events/{{eventId}}/guests
```

**Expected Result:**
- ✅ Returns 3 guests
- ✅ Alice: checkedIn: true, rsvpStatus: "yes"
- ✅ Bob: checkedIn: true, rsvpStatus: "yes"
- ✅ Charlie: checkedIn: true, rsvpStatus: "pending"

**Request:** `List Event Gates`

**Test:**
```json
GET /api/events/{{eventId}}/gates
```

**Expected Result:**
- ✅ Returns 2 gates
- ✅ Both active

---

## Scenario 2: Error Scenarios

### Test 2.1: Invalid Gate Authentication
**Request:** `🔓 Gate Authentication (Public)`

**Test - Wrong Access Code:**
```json
POST /api/gates/auth
{
  "gateId": "{{mainGateId}}",
  "accessCode": "WRONG123"
}
```

**Expected Result:**
- ✅ Status: 403 Forbidden
- ✅ Error: "Invalid gate access code"

---

### Test 2.2: Scan Without Authentication
**Request:** `🎫 Scan Guest (Secure)`

**Test - No Token:**
```json
POST /api/scan
// Remove Authorization header
{
  "guestId": "{{aliceGuestId}}",
  "scanData": "QR_TEST"
}
```

**Expected Result:**
- ✅ Status: 401 Unauthorized
- ✅ Error: "Valid gate session token required"

---

### Test 2.3: Scan with Expired Token
**Manual Test:**
1. Authenticate to gate
2. Wait 4+ hours (or manually change token expiry in code for testing)
3. Try to scan

**Expected Result:**
- ✅ Status: 401 Unauthorized
- ✅ Token validation fails

---

### Test 2.4: Inactive Gate
**Request:** `Deactivate Gate`

**Test:**
```json
POST /api/gates/{{vipGateId}}/deactivate
```

**Then try to authenticate:**
```json
POST /api/gates/auth
{
  "gateId": "{{vipGateId}}",
  "accessCode": "VIP2025"
}
```

**Expected Result:**
- ✅ Status: 403 Forbidden
- ✅ Error: "Gate is not active"

**Reactivate for further testing:**
```json
POST /api/gates/{{vipGateId}}/activate
```

---

### Test 2.5: Duplicate Guest Scan
**Request:** `🎫 Scan Guest (Secure)`

**Test - Scan Alice Again:**
```json
POST /api/scan
Authorization: Bearer {{mainGateToken}}
{
  "guestId": "{{aliceGuestId}}",
  "scanData": "QR_ALICE_SECOND"
}
```

**Expected Result:**
- ✅ Status: 201 Created (allows multiple scans)
- ✅ New scan record created
- ✅ Guest already checked in

**Note:** Multiple scans are allowed for entry/exit tracking

---

### Test 2.6: Guest Not in Event
**Test - Invalid Guest ID:**
```json
POST /api/scan
Authorization: Bearer {{mainGateToken}}
{
  "guestId": "00000000-0000-0000-0000-000000000000",
  "scanData": "QR_FAKE"
}
```

**Expected Result:**
- ✅ Status: 404 Not Found
- ✅ Error: "Guest not found"

---

## Scenario 3: Update Operations

### Test 3.1: Update Guest Details
**Request:** `Update Guest`

**Test:**
```json
PATCH /api/guests/{{aliceGuestId}}
{
  "name": "Alice Johnson-Smith",
  "phone": "+1987654321"
}
```

**Expected Result:**
- ✅ Status: 200 OK
- ✅ Guest name and phone updated

---

### Test 3.2: Update Event Details
**Request:** `Update Event`

**Test:**
```json
PATCH /api/events/{{eventId}}
Authorization: Bearer {{accessToken}}
{
  "description": "Updated: Full E2E system test",
  "venue": "New Test Center"
}
```

**Expected Result:**
- ✅ Status: 200 OK
- ✅ Event details updated

---

### Test 3.3: Regenerate Gate Access Code
**Request:** `Regenerate Access Code`

**Test:**
```json
POST /api/gates/{{vipGateId}}/regenerate-code
```

**Expected Result:**
- ✅ Status: 200 OK
- ✅ New access code generated
- ✅ Auto-saves new code

**Verify:**
- Old code "VIP2025" no longer works
- New code works for authentication

---

## Scenario 4: Event Lifecycle

### Test 4.1: Cancel Event
**Request:** `Cancel Event`

**Test:**
```json
POST /api/events/{{eventId}}/cancel
Authorization: Bearer {{accessToken}}
{
  "reason": "Testing cancellation flow"
}
```

**Expected Result:**
- ✅ Status: 200 OK
- ✅ Event status: "cancelled"
- ✅ Cancellation reason stored

---

### Test 4.2: Manual Check-In/Check-Out
**Request:** `Check In Guest`

**Test:**
```json
POST /api/guests/{{charlieGuestId}}/checkin
```

**Expected Result:**
- ✅ Status: 200 OK
- ✅ Guest checked in (manual)

**Request:** `Check Out Guest`

**Test:**
```json
POST /api/guests/{{charlieGuestId}}/checkout
```

**Expected Result:**
- ✅ Status: 200 OK
- ✅ Guest checked out

---

## 📊 Test Checklist

### ✅ Core Functionality
- [ ] Organizer can sign up/sign in
- [ ] Organizer can create events
- [ ] Organizer can create multiple gates
- [ ] Organizer can add multiple guests
- [ ] Organizer can update event/guest/gate details
- [ ] Organizer can publish/cancel events
- [ ] Anonymous users can authenticate to gates (public endpoint)
- [ ] Authenticated gate operators can scan guests
- [ ] Guests are auto-checked in on scan
- [ ] Scan history is tracked per event/gate/guest

### ✅ Security
- [ ] Gate authentication requires valid access code
- [ ] Scan endpoint requires valid gate session token
- [ ] Token expires after 4 hours
- [ ] Invalid tokens are rejected
- [ ] Inactive gates cannot be authenticated
- [ ] gateId and eventId extracted from JWT (not spoofable)

### ✅ Data Integrity
- [ ] All IDs are valid UUIDs
- [ ] Timestamps are recorded correctly
- [ ] Relationships maintained (guest → event, gate → event, scan → guest/gate)
- [ ] RSVP status updates correctly
- [ ] Check-in status updates on scan

### ✅ Error Handling
- [ ] Invalid credentials rejected
- [ ] Missing required fields rejected
- [ ] Invalid UUIDs rejected
- [ ] Expired tokens rejected
- [ ] Duplicate access codes prevented

---

## 🎯 Success Criteria

All tests should pass with:
- ✅ Correct HTTP status codes
- ✅ Proper error messages
- ✅ Data persisted to database
- ✅ Environment variables auto-populated
- ✅ No server errors in console

---

## 🔄 Running Tests in Sequence

### Postman Collection Runner Order:

1. Sign In
2. Create Event
3. Create Gate (Main)
4. Create Gate (VIP)
5. Add Guest (Alice)
6. Add Guest (Bob)
7. Add Guest (Charlie)
8. Update RSVP (Alice → yes)
9. Update RSVP (Bob → yes)
10. Publish Event
11. Gate Auth (Main)
12. Gate Auth (VIP)
13. Scan Guest (Alice @ Main)
14. Scan Guest (Bob @ Main)
15. Scan Guest (Charlie @ VIP)
16. Get Event Scans
17. Get Gate Scans (Main)
18. Get Guest Scan History (Alice)
19. List Event Guests
20. Verify all data

---

## 🧹 Cleanup (Optional)

After testing, you can clean up test data:

1. Delete test guests
2. Delete test gates
3. Delete test event
4. Delete test organizer (via Supabase Dashboard)

**Or** keep for future testing reference.

---

## 📝 Notes

- Save this document for reference
- Run complete flow before each deployment
- Update as new features are added
- Track any failing tests as bugs

---

## 🚀 Next: Automated Testing

Consider setting up automated E2E tests with:
- **Playwright** - For frontend + API testing
- **Supertest** - For API-only testing
- **GitHub Actions** - Run tests on every commit

Would you like help setting up automated tests?
