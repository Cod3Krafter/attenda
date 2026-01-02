# Gate Session Revocation Feature

## ✨ New Feature: Immediate Session Revocation

When regenerating a gate access code, you can now **optionally revoke all existing gate sessions** immediately, providing instant security control.

---

## 🚀 Usage

### Basic Regeneration (Default Behavior)
Generates new code but keeps existing sessions active:

```http
POST /api/gates/{gateId}/regenerate-code
Authorization: Bearer {organizerToken}
```

**Result:**
- ✅ New access code generated
- ✅ Old code no longer works for NEW logins
- ⚠️ Existing sessions remain valid (4-hour timeout)

---

### Regeneration with Session Revocation (New!)
Generates new code AND immediately invalidates all active sessions:

```http
POST /api/gates/{gateId}/regenerate-code?revokeSessions=true
Authorization: Bearer {organizerToken}
```

**Result:**
- ✅ New access code generated
- ✅ Old code no longer works for NEW logins
- ✅ **All existing sessions immediately revoked**
- ✅ All gate operators must re-authenticate with new code

---

## 📊 Comparison

| Scenario | Without Revocation | With Revocation (`?revokeSessions=true`) |
|----------|-------------------|------------------------------------------|
| **New Code Generated** | ✅ | ✅ |
| **Old Code Works** | ❌ No (for new logins) | ❌ No (for new logins) |
| **Existing Sessions** | ✅ Valid for 4 hours | ❌ **Immediately revoked** |
| **Active Operators** | Can continue scanning | Must re-authenticate |
| **Use Case** | Planned rotation | Security breach/emergency |

---

## 🎯 When to Use Each Option

### ✅ Use Default (No Revocation)

**Best for:**
- Regular security rotation
- Shift changes (current shift can finish)
- Post-event cleanup
- Planned code updates
- Different operators for different time periods

**Example:**
```
Scenario: Event ends at 6 PM, new crew starts tomorrow
Action: Regenerate code at 6 PM (without revocation)
Result: Current crew can work until 10 PM (4hr timeout)
        New crew uses new code tomorrow
```

---

### ✅ Use With Revocation (`?revokeSessions=true`)

**Best for:**
- Security breach detected
- Compromised operator device
- Lost device with active session
- Suspicious activity
- Immediate access revocation needed
- Operator termination

**Example:**
```
Scenario: Operator's phone was stolen with active session
Action: Regenerate code?revokeSessions=true
Result: Stolen phone immediately can't scan
        All operators must re-authenticate
```

---

## 🔐 Security Benefits

### Before This Feature
```
Problem: Operator leaves company with active 4-hour token
Risk: They can still scan guests for up to 4 hours
Workaround: Deactivate entire gate (blocks everyone)
```

### After This Feature
```
Solution: Regenerate with revocation
Result: Immediate revocation + New code for legitimate operators
Benefit: Granular security control without disrupting service
```

---

## 📝 API Examples

### Postman Collection Update

**Without Revocation:**
```
POST {{baseUrl}}/api/gates/{{gateId}}/regenerate-code
Headers:
  Authorization: Bearer {{accessToken}}
```

**With Revocation:**
```
POST {{baseUrl}}/api/gates/{{gateId}}/regenerate-code?revokeSessions=true
Headers:
  Authorization: Bearer {{accessToken}}
```

### cURL Examples

**Default (No Revocation):**
```bash
curl -X POST "https://api.attenda.com/api/gates/gate-123/regenerate-code" \
  -H "Authorization: Bearer your-token-here"
```

**With Revocation:**
```bash
curl -X POST "https://api.attenda.com/api/gates/gate-123/regenerate-code?revokeSessions=true" \
  -H "Authorization: Bearer your-token-here"
```

---

## 🎬 Complete Workflow Examples

### Example 1: Security Breach Response

```
1. Breach detected at Main Gate

2. POST /api/gates/{mainGateId}/regenerate-code?revokeSessions=true
   Response: { "accessCode": "NEW789" }

3. All existing sessions immediately invalid

4. Share NEW789 with trusted operators only

5. Operators re-authenticate:
   POST /api/gates/auth
   { "gateId": "{mainGateId}", "accessCode": "NEW789" }

6. Service restored with new secure tokens
```

### Example 2: Planned Shift Change

```
1. Day shift ending at 5 PM

2. POST /api/gates/{gateId}/regenerate-code
   (No revocation - day shift can finish)
   Response: { "accessCode": "NIGHT456" }

3. Day shift continues scanning until timeout

4. Share NIGHT456 with night shift

5. Night shift authenticates at 5 PM:
   POST /api/gates/auth
   { "gateId": "{gateId}", "accessCode": "NIGHT456" }

6. Smooth transition without disruption
```

---

## ⚡ Technical Details

### Query Parameter
- **Name:** `revokeSessions`
- **Type:** Boolean (string)
- **Values:** `"true"` or `"false"` (default: `"false"`)
- **Case Sensitive:** No

### Implementation
```typescript
// Controller signature
async regenerateAccessCode(
    id: string,
    options?: { revokeExistingSessions?: boolean }
): Promise<ControllerResponse<Gate>>

// Internal flow
1. Validate gate exists
2. Generate unique new code
3. IF revokeSessions=true → Delete all gate sessions
4. Update gate with new code
5. Return updated gate
```

### Database Impact
```sql
-- When revokeSessions=true, this happens:
DELETE FROM gate_sessions WHERE gate_id = '{gateId}';

-- Result: All rows for this gate are removed
-- Affected operators: Receive 401 on next scan attempt
```

---

## 🔄 Operator Experience

### Without Revocation
```
Operator Timeline:
10:00 AM - Authenticated with old code "ABC123"
10:30 AM - Organizer regenerates code → New: "XYZ789"
10:31 AM - Operator scans guest → ✅ Still works
11:00 AM - Operator scans guest → ✅ Still works
2:00 PM - Token expires naturally
2:01 PM - Operator scans guest → ❌ Must re-auth
```

### With Revocation
```
Operator Timeline:
10:00 AM - Authenticated with old code "ABC123"
10:30 AM - Organizer regenerates with revocation
10:30 AM - Operator's session IMMEDIATELY revoked
10:31 AM - Operator scans guest → ❌ 401 Unauthorized
10:32 AM - Operator must re-authenticate with new code
```

---

## ⚠️ Important Notes

1. **Revocation is Immediate:** Sessions are deleted instantly, no grace period

2. **All Operators Affected:** The revocation affects ALL operators at that gate, not just one

3. **Cannot Undo:** Once sessions are revoked, operators must re-authenticate

4. **Consider Impact:** If gate is actively scanning hundreds of guests, revocation will disrupt all operators simultaneously

5. **Communication:** Inform operators before revoking to minimize confusion

6. **Alternative:** If only one operator is compromised, consider creating a new gate instead

---

## 🆕 Updated Postman Tests

Add to your Postman collection:

**Test: Regenerate Without Revocation**
```javascript
pm.test("New code generated", function () {
    pm.expect(pm.response.json().data.accessCode).to.not.equal(pm.environment.get("oldAccessCode"));
});
```

**Test: Regenerate With Revocation**
```javascript
// After regenerating with revocation
pm.test("Old session should be invalid", function () {
    pm.sendRequest({
        url: pm.environment.get("baseUrl") + "/api/scan",
        method: "POST",
        header: { "Authorization": "Bearer " + pm.environment.get("oldGateToken") },
        body: { "qrCode": "TEST-QR" }
    }, function (err, response) {
        pm.expect(response).to.have.status(401);
    });
});
```

---

## 📊 Monitoring & Logging

When sessions are revoked, check logs for:

```
Gate session revocation triggered
Gate ID: gate-123
Sessions deleted: 3
Reason: Access code regeneration
Timestamp: 2025-01-15T10:30:00Z
```

---

## 🎯 Recommendation

**For Production:**
- Default: Use WITHOUT revocation (planned rotations)
- Emergency: Use WITH revocation (security incidents)
- Documentation: Clearly communicate to operators when revocation will occur
- Monitoring: Track session revocations for audit purposes

---

**This feature provides you with immediate security control when you need it, while maintaining operational flexibility for planned rotations.** 🔒✨
