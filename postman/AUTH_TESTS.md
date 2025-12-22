# Authentication Testing Guide

## 🎯 Testing All Protected Endpoints

After adding authentication, verify that all endpoints properly reject unauthorized requests.

---

## Quick Test Checklist

### ✅ Step 1: Test Protected Endpoints (Should Return 401)

**Remove the Authorization header** from these requests and verify they return `401 Unauthorized`:

#### Event Endpoints
- [ ] `GET /api/events` - Should return 401
- [ ] `POST /api/events` - Should return 401
- [ ] `GET /api/events/{{eventId}}` - Should return 401
- [ ] `PATCH /api/events/{{eventId}}` - Should return 401
- [ ] `DELETE /api/events/{{eventId}}` - Should return 401
- [ ] `POST /api/events/{{eventId}}/publish` - Should return 401
- [ ] `POST /api/events/{{eventId}}/cancel` - Should return 401

#### Gate Endpoints
- [ ] `GET /api/events/{{eventId}}/gates` - Should return 401
- [ ] `POST /api/events/{{eventId}}/gates` - Should return 401
- [ ] `GET /api/gates/{{gateId}}` - Should return 401
- [ ] `PATCH /api/gates/{{gateId}}` - Should return 401
- [ ] `DELETE /api/gates/{{gateId}}` - Should return 401
- [ ] `POST /api/gates/{{gateId}}/regenerate-code` - Should return 401
- [ ] `POST /api/gates/{{gateId}}/activate` - Should return 401
- [ ] `POST /api/gates/{{gateId}}/deactivate` - Should return 401

#### Guest Endpoints
- [ ] `GET /api/events/{{eventId}}/guests` - Should return 401
- [ ] `POST /api/events/{{eventId}}/guests` - Should return 401
- [ ] `GET /api/guests/{{guestId}}` - Should return 401
- [ ] `PATCH /api/guests/{{guestId}}` - Should return 401
- [ ] `DELETE /api/guests/{{guestId}}` - Should return 401
- [ ] `POST /api/guests/{{guestId}}/checkin` - Should return 401
- [ ] `POST /api/guests/{{guestId}}/checkout` - Should return 401

#### Scan History Endpoints
- [ ] `GET /api/events/{{eventId}}/scans` - Should return 401
- [ ] `GET /api/gates/{{gateId}}/scans` - Should return 401
- [ ] `GET /api/guests/{{guestId}}/scans` - Should return 401

---

### ✅ Step 2: Verify Public Endpoints Still Work (Should Return 200/201)

**These should work WITHOUT the Authorization header:**

#### Authentication
- [ ] `POST /api/auth/signup` - Should return 201
- [ ] `POST /api/auth/signin` - Should return 200

#### Gate Operations
- [ ] `POST /api/gates/auth` - Should return 201 (with valid gateId + accessCode)

#### Scanning
- [ ] `POST /api/scan` - Should return 201 (with valid gate session token)

#### Guest Self-Service
- [ ] `POST /api/guests/{{guestId}}/rsvp` - Should return 200

---

### ✅ Step 3: Verify Protected Endpoints Work WITH Auth (Should Return 200/201)

**Add the Authorization header back** and verify endpoints work normally:

Run the complete E2E test flow from [E2E_TEST_FLOW.md](./E2E_TEST_FLOW.md) to verify all protected endpoints work with authentication.

---

## 🧪 How to Test in Postman

### Method 1: Disable Authorization Header

1. Open any protected endpoint request
2. Go to the **Headers** tab
3. **Uncheck** the Authorization header
4. Send the request
5. Expected response:
```json
{
  "success": false,
  "error": {
    "message": "Authentication required. Please sign in as an organizer.",
    "code": "AUTH_REQUIRED"
  }
}
```
6. **Re-check** the Authorization header before moving to next test

### Method 2: Create a Negative Test Collection

1. Duplicate your "Attenda API" collection
2. Rename to "Attenda API - Auth Tests"
3. For each protected endpoint:
   - Remove the Authorization header
   - Add test script:
   ```javascript
   pm.test("Returns 401 Unauthorized", function () {
       pm.response.to.have.status(401);
   });

   pm.test("Returns AUTH_REQUIRED error", function () {
       const response = pm.response.json();
       pm.expect(response.success).to.be.false;
       pm.expect(response.error.code).to.equal("AUTH_REQUIRED");
   });
   ```

---

## 🎯 Quick Test (5 Minutes)

Test these critical endpoints to verify auth is working:

### Without Auth (Should Fail):
1. `GET /api/events/{{eventId}}/guests` → 401
2. `POST /api/events/{{eventId}}/gates` → 401
3. `GET /api/gates/{{gateId}}` → 401
4. `POST /api/events` → 401

### With Auth (Should Work):
1. `POST /api/auth/signin` → 200 (saves token)
2. `GET /api/events` → 200
3. `POST /api/events` → 201
4. `GET /api/events/{{eventId}}/guests` → 200

### Public Endpoints (No Auth Needed):
1. `POST /api/gates/auth` → 201
2. `POST /api/scan` (with gate token) → 201

---

## 📊 Expected Error Response Format

All protected endpoints should return this when accessed without auth:

```json
{
  "success": false,
  "error": {
    "message": "Authentication required. Please sign in as an organizer.",
    "code": "AUTH_REQUIRED"
  }
}
```

**HTTP Status:** `401 Unauthorized`

---

## ✅ Success Criteria

Your authentication is working correctly if:

1. ✅ All 32 protected endpoints return `401 Unauthorized` without token
2. ✅ All 32 protected endpoints work normally WITH token
3. ✅ All 5 public endpoints work WITHOUT token
4. ✅ Error response format is consistent
5. ✅ Error code is always `AUTH_REQUIRED` for auth failures

---

## 🐛 Troubleshooting

### Issue: Endpoint still works without auth
**Solution:** Check that the endpoint has the `getAuthUser` check at the start of the function

### Issue: Endpoint returns 500 instead of 401
**Solution:** Check server logs for errors, ensure `getAuthUser` helper is imported

### Issue: All endpoints return 401 (even with valid token)
**Solution:**
- Verify token is being saved correctly after signin
- Check that `{{accessToken}}` variable is populated
- Test signin again to refresh token

---

## 📝 Testing Notes

- Test WITHOUT auth first to verify protection
- Then test WITH auth to verify functionality
- Public endpoints should NEVER require organizer auth
- Gate scanning uses gate session token (different from organizer token)

---

**Ready to test? Start with the Quick Test above!**
