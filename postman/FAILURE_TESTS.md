# API Failure & Error Testing Guide

## 🎯 Testing Error Handling

This guide covers all failure scenarios to ensure your API handles errors gracefully.

---

## 📋 Failure Test Categories

1. **Authentication Failures**
2. **Validation Failures**
3. **Authorization Failures**
4. **Not Found Failures**
5. **Business Logic Failures**
6. **Token Expiry Failures**

---

## 🔴 Test Scenarios

## Category 1: Authentication Failures

### Test 1.1: Sign In with Wrong Password
**Request:** Sign In

```json
POST /api/auth/signin
{
  "email": "organizer@example.com",
  "password": "WrongPassword123"
}
```

**Expected:**
- ✅ Status: `401 Unauthorized`
- ✅ Error: "Invalid credentials"

---

### Test 1.2: Sign In with Non-Existent Email
**Request:** Sign In

```json
POST /api/auth/signin
{
  "email": "nonexistent@example.com",
  "password": "AnyPassword123"
}
```

**Expected:**
- ✅ Status: `401 Unauthorized`
- ✅ Error: "Invalid credentials"

---

### Test 1.3: Create Event Without Token
**Request:** Create Event

```json
POST /api/events
// Remove Authorization header!
{
  "organizerId": "{{organizerId}}",
  "title": "Test Event"
}
```

**Expected:**
- ✅ Status: `401 Unauthorized`
- ✅ Error: "Authentication required"

---

### Test 1.4: Use Invalid/Malformed Token
**Request:** Create Event

```json
POST /api/events
Authorization: Bearer invalid-token-12345
{
  "organizerId": "{{organizerId}}",
  "title": "Test Event"
}
```

**Expected:**
- ✅ Status: `401 Unauthorized`
- ✅ Error: "Authentication required"

---

## Category 2: Validation Failures

### Test 2.1: Create Event - Missing Required Fields
**Request:** Create Event

```json
POST /api/events
Authorization: Bearer {{accessToken}}
{
  "organizerId": "{{organizerId}}"
  // Missing: title, venue, endDate
}
```

**Expected:**
- ✅ Status: `400 Bad Request`
- ✅ Error: "Validation error" or specific field errors

---

### Test 2.2: Create Event - Invalid Date Format
**Request:** Create Event

```json
POST /api/events
Authorization: Bearer {{accessToken}}
{
  "organizerId": "{{organizerId}}",
  "title": "Test Event",
  "venue": "Test Venue",
  "endDate": "invalid-date"
}
```

**Expected:**
- ✅ Status: `400 Bad Request` or `500 Internal Server Error`
- ✅ Error related to date parsing

---

### Test 2.3: Create Guest - Invalid Email
**Request:** Add Guest to Event

```json
POST /api/events/{{eventId}}/guests
{
  "name": "Test Guest",
  "email": "not-an-email",
  "phone": "+1234567890"
}
```

**Expected:**
- ✅ Status: `400 Bad Request`
- ✅ Error: "Invalid email format"

---

### Test 2.4: Update RSVP - Invalid Status
**Request:** Update RSVP

```json
POST /api/guests/{{guestId}}/rsvp
{
  "status": "maybe"
}
```

**Expected:**
- ✅ Status: `400 Bad Request`
- ✅ Error: "Invalid RSVP status" (should be "yes", "no", or "pending")

---

### Test 2.5: Create Gate - Empty Access Code
**Request:** Create Gate (Custom Code)

```json
POST /api/events/{{eventId}}/gates
{
  "name": "Test Gate",
  "accessCode": ""
}
```

**Expected:**
- ✅ Status: `400 Bad Request`
- ✅ Error: "Access code cannot be empty"

---

### Test 2.6: Gate Auth - Missing Fields
**Request:** Gate Authentication

```json
POST /api/gates/auth
{
  "gateId": "{{gateId}}"
  // Missing: accessCode
}
```

**Expected:**
- ✅ Status: `400 Bad Request`
- ✅ Error: "gateId and accessCode are required"

---

## Category 3: Authorization Failures

### Test 3.1: Gate Auth - Wrong Access Code
**Request:** Gate Authentication

```json
POST /api/gates/auth
{
  "gateId": "{{gateId}}",
  "accessCode": "WRONG123"
}
```

**Expected:**
- ✅ Status: `403 Forbidden`
- ✅ Error: "Invalid gate access code"

---

### Test 3.2: Gate Auth - Inactive Gate
**Prepare:** First deactivate a gate

```json
POST /api/gates/{{gateId}}/deactivate
```

**Then test:**
```json
POST /api/gates/auth
{
  "gateId": "{{gateId}}",
  "accessCode": "{{accessCode}}"
}
```

**Expected:**
- ✅ Status: `403 Forbidden`
- ✅ Error: "Gate is not active"

**Cleanup:** Reactivate gate
```json
POST /api/gates/{{gateId}}/activate
```

---

### Test 3.3: Scan Without Gate Session Token
**Request:** Scan Guest

```json
POST /api/scan
// Remove Authorization header!
{
  "guestId": "{{guestId}}",
  "scanData": "QR_TEST"
}
```

**Expected:**
- ✅ Status: `401 Unauthorized`
- ✅ Error: "Valid gate session token required"

---

### Test 3.4: Scan With Invalid Token
**Request:** Scan Guest

```json
POST /api/scan
Authorization: Bearer fake-token-12345
{
  "guestId": "{{guestId}}",
  "scanData": "QR_TEST"
}
```

**Expected:**
- ✅ Status: `401 Unauthorized`
- ✅ Error: "Valid gate session token required"

---

## Category 4: Not Found Failures

### Test 4.1: Get Non-Existent Event
**Request:** Get Event

```json
GET /api/events/00000000-0000-0000-0000-000000000000
Authorization: Bearer {{accessToken}}
```

**Expected:**
- ✅ Status: `404 Not Found`
- ✅ Error: "Event not found"

---

### Test 4.2: Get Non-Existent Guest
**Request:** Get Guest

```json
GET /api/guests/00000000-0000-0000-0000-000000000000
```

**Expected:**
- ✅ Status: `404 Not Found`
- ✅ Error: "Guest not found"

---

### Test 4.3: Get Non-Existent Gate
**Request:** Get Gate

```json
GET /api/gates/00000000-0000-0000-0000-000000000000
```

**Expected:**
- ✅ Status: `404 Not Found`
- ✅ Error: "Gate not found"

---

### Test 4.4: Update Non-Existent Guest
**Request:** Update Guest

```json
PATCH /api/guests/00000000-0000-0000-0000-000000000000
{
  "name": "Updated Name"
}
```

**Expected:**
- ✅ Status: `404 Not Found`
- ✅ Error: "Guest not found"

---

### Test 4.5: Scan Non-Existent Guest
**Request:** Scan Guest

```json
POST /api/scan
Authorization: Bearer {{gateSessionToken}}
{
  "guestId": "00000000-0000-0000-0000-000000000000",
  "scanData": "QR_TEST"
}
```

**Expected:**
- ✅ Status: `404 Not Found`
- ✅ Error: "Guest not found"

---

## Category 5: Business Logic Failures

### Test 5.1: Duplicate Access Code
**Prepare:** Create a gate with custom code

```json
POST /api/events/{{eventId}}/gates
{
  "name": "Gate 1",
  "accessCode": "DUPLICATE123"
}
```

**Then try to create another with same code:**
```json
POST /api/events/{{eventId}}/gates
{
  "name": "Gate 2",
  "accessCode": "DUPLICATE123"
}
```

**Expected:**
- ✅ Status: `409 Conflict`
- ✅ Error: "Access code already exists"

---

### Test 5.2: Publish Already Published Event
**Prepare:** Publish an event

```json
POST /api/events/{{eventId}}/publish
Authorization: Bearer {{accessToken}}
```

**Then try to publish again:**
```json
POST /api/events/{{eventId}}/publish
Authorization: Bearer {{accessToken}}
```

**Expected:**
- ✅ Status: `400 Bad Request` or `409 Conflict`
- ✅ Error: "Event is already published" or similar

---

### Test 5.3: Cancel Already Cancelled Event
**Prepare:** Cancel an event

```json
POST /api/events/{{eventId}}/cancel
Authorization: Bearer {{accessToken}}
{
  "reason": "First cancellation"
}
```

**Then try to cancel again:**
```json
POST /api/events/{{eventId}}/cancel
Authorization: Bearer {{accessToken}}
{
  "reason": "Second cancellation"
}
```

**Expected:**
- ✅ Status: `400 Bad Request`
- ✅ Error: "Event is already cancelled" or similar

---

### Test 5.4: Add Guest with Duplicate Email (if enforced)
**Prepare:** Add a guest

```json
POST /api/events/{{eventId}}/guests
{
  "name": "Test Guest",
  "email": "duplicate@test.com",
  "phone": "+1234567890"
}
```

**Then try to add another with same email:**
```json
POST /api/events/{{eventId}}/guests
{
  "name": "Another Guest",
  "email": "duplicate@test.com",
  "phone": "+1987654321"
}
```

**Expected (if enforced):**
- ✅ Status: `409 Conflict`
- ✅ Error: "Guest with this email already exists"

**Or (if allowed):**
- ✅ Status: `201 Created`
- ✅ Both guests exist (multiple guests with same email allowed)

---

## Category 6: Token Expiry Failures

### Test 6.1: Use Expired Gate Session Token

**Manual Test (requires time manipulation):**

1. Authenticate to gate → get token
2. **Option A:** Wait 4+ hours
3. **Option B:** Change token expiry in code temporarily:
   ```typescript
   // In src/lib/gateAuth.ts, change:
   const expiresIn = 10; // 10 seconds instead of 4 hours
   ```
4. Restart server
5. Authenticate, wait 11 seconds, then scan

**Expected:**
- ✅ Status: `401 Unauthorized`
- ✅ Error: "Valid gate session token required"

**Cleanup:** Restore original expiry time

---

### Test 6.2: Use Expired Organizer Token

**Prepare:** Get an organizer token, wait for Supabase session expiry (default: 1 hour)

**Then:**
```json
POST /api/events
Authorization: Bearer <expired-token>
{
  "organizerId": "{{organizerId}}",
  "title": "Test Event"
}
```

**Expected:**
- ✅ Status: `401 Unauthorized`
- ✅ Error: "Authentication required" or "Token expired"

---

## Category 7: Invalid UUID Failures

### Test 7.1: Create Event with Invalid organizerId
**Request:** Create Event

```json
POST /api/events
Authorization: Bearer {{accessToken}}
{
  "organizerId": "not-a-uuid",
  "title": "Test Event",
  "venue": "Test Venue",
  "endDate": "2025-12-31T23:59:59Z"
}
```

**Expected:**
- ✅ Status: `400 Bad Request` or `500 Internal Server Error`
- ✅ Error: "Invalid UUID" or database error

---

### Test 7.2: Get Event with Malformed ID
**Request:** Get Event

```json
GET /api/events/invalid-uuid-format
Authorization: Bearer {{accessToken}}
```

**Expected:**
- ✅ Status: `400 Bad Request` or `404 Not Found`
- ✅ Error related to invalid ID format

---

## 📊 Failure Test Checklist

### Authentication & Authorization
- [ ] Wrong password returns 401
- [ ] Non-existent user returns 401
- [ ] Missing token returns 401
- [ ] Invalid token returns 401
- [ ] Wrong access code returns 403
- [ ] Inactive gate auth returns 403
- [ ] Scan without token returns 401

### Validation
- [ ] Missing required fields return 400
- [ ] Invalid email format returns 400
- [ ] Invalid date format returns 400
- [ ] Invalid RSVP status returns 400
- [ ] Empty access code returns 400
- [ ] Invalid UUID format handled

### Not Found
- [ ] Non-existent event returns 404
- [ ] Non-existent guest returns 404
- [ ] Non-existent gate returns 404
- [ ] Operations on deleted resources return 404

### Business Logic
- [ ] Duplicate access code prevented
- [ ] Event state transitions validated
- [ ] Duplicate operations handled

### Token Expiry
- [ ] Expired gate token rejected
- [ ] Expired organizer token rejected

---

## 🧪 How to Run Failure Tests in Postman

### Method 1: Manual Testing

1. Run a happy path test
2. Modify the request to trigger error
3. Verify error response
4. Reset for next test

### Method 2: Create Negative Test Collection

1. **Duplicate** your "Attenda API" collection
2. **Rename** to "Attenda API - Failure Tests"
3. **Modify** each request to trigger errors
4. **Add tests** to verify error codes:

```javascript
// In Postman Tests tab:
pm.test("Returns 401 Unauthorized", function () {
    pm.response.to.have.status(401);
});

pm.test("Returns error message", function () {
    const response = pm.response.json();
    pm.expect(response.success).to.be.false;
    pm.expect(response.error).to.exist;
});
```

### Method 3: Use Pre-request Scripts

```javascript
// In Pre-request Script tab:
// Deliberately use wrong token
pm.environment.set('accessToken', 'invalid-token');
```

---

## 🎯 Testing Strategy

### Quick Failure Test (5 min)
Run these high-priority failures:
1. Wrong password
2. Missing auth token
3. Invalid access code
4. Scan without token
5. Non-existent resource

### Complete Failure Test (20 min)
Run all scenarios from each category

### Continuous Testing
Include failure tests in CI/CD pipeline

---

## 📝 Expected Error Response Format

All errors should follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE"
  }
}
```

**Common Error Codes:**
- `AUTH_REQUIRED` - Authentication required
- `AUTH_ERROR` - Authentication failed
- `VALIDATION_ERROR` - Invalid input
- `NOT_FOUND` - Resource not found
- `INVALID_ACCESS_CODE` - Wrong gate code
- `GATE_INACTIVE` - Gate is deactivated
- `INTERNAL_ERROR` - Server error

---

## 🐛 What to Look For

### Good Error Handling ✅
- Clear error messages
- Appropriate HTTP status codes
- No sensitive data leaked
- Consistent error format
- Server doesn't crash

### Bad Error Handling ❌
- Generic "Error" messages
- Wrong status codes (e.g., 200 for errors)
- Stack traces exposed
- Server crashes
- Inconsistent format

---

## 🔄 After Finding Issues

1. **Document** the failing test
2. **Create** a bug report
3. **Fix** the issue
4. **Re-run** the test
5. **Verify** fix works
6. **Add** to regression suite

---

## 📚 Additional Resources

- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [REST API Error Handling Best Practices](https://www.rfc-editor.org/rfc/rfc7807)
- [Postman Testing Guide](https://learning.postman.com/docs/writing-scripts/test-scripts/)

---

## ✅ Success Criteria

Your API has good error handling if:
- ✅ All failure tests return correct status codes
- ✅ Error messages are clear and helpful
- ✅ No sensitive data exposed in errors
- ✅ Server remains stable during errors
- ✅ Errors are logged properly (check server console)

---

**Ready to test failures? Start with the Quick Failure Test above!**
