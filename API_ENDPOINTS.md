# Attenda API Endpoints - Complete Reference

## 📊 Project Status

**Tests:** ✅ 39/39 passing
**Security:** ✅ Authentication + Input Sanitization implemented
**Total Endpoints:** 37
**Protected Endpoints:** 32
**Public Endpoints:** 5

---

## 🔐 Authentication Endpoints (Public)

### 1. **Organizer Signup**
- **Endpoint:** `POST /api/auth/signup`
- **Protection:** 🔓 Public
- **Purpose:** Create a new organizer account
- **Request Body:**
  ```json
  {
    "email": "organizer@example.com",
    "password": "securePassword123",
    "name": "John Doe"
  }
  ```
- **Response:** `201 Created` with access token
- **Use Case:** First-time organizer registration

### 2. **Organizer Signin**
- **Endpoint:** `POST /api/auth/signin`
- **Protection:** 🔓 Public
- **Purpose:** Authenticate existing organizer
- **Request Body:**
  ```json
  {
    "email": "organizer@example.com",
    "password": "securePassword123"
  }
  ```
- **Response:** `200 OK` with access token
- **Use Case:** Organizer login to manage events

---

## 📅 Event Management Endpoints (Protected)

### 3. **List All Events**
- **Endpoint:** `GET /api/events`
- **Protection:** 🔒 Protected (Organizer Auth Required)
- **Purpose:** Retrieve all events or filter by organizerId
- **Query Params:** `?organizerId={id}` (optional)
- **Response:** Array of event objects
- **Use Case:** Dashboard view of all events

### 4. **Get Event Details**
- **Endpoint:** `GET /api/events/{eventId}`
- **Protection:** 🔒 Protected (Organizer Auth Required)
- **Purpose:** Retrieve details of a specific event
- **Response:** Single event object with all details
- **Use Case:** View event information

### 5. **Create Event**
- **Endpoint:** `POST /api/events`
- **Protection:** 🔒 Protected (Organizer Auth Required)
- **Purpose:** Create a new event (draft status)
- **Request Body:**
  ```json
  {
    "organizerId": "uuid",
    "title": "Tech Conference 2025",
    "description": "Annual tech conference",
    "venue": "Convention Center, NYC",
    "startDate": "2025-01-15T09:00:00Z",
    "endDate": "2025-01-16T18:00:00Z"
  }
  ```
- **Response:** `201 Created` with event object
- **Use Case:** Organizer creates new event

### 6. **Update Event**
- **Endpoint:** `PATCH /api/events/{eventId}`
- **Protection:** 🔒 Protected (Organizer Auth Required)
- **Purpose:** Update event details (title, description, venue, dates)
- **Request Body:** Partial event object
- **Response:** `200 OK` with updated event
- **Use Case:** Edit event information

### 7. **Delete Event**
- **Endpoint:** `DELETE /api/events/{eventId}`
- **Protection:** 🔒 Protected (Organizer Auth Required)
- **Purpose:** Permanently delete an event
- **Response:** `200 OK` with success message
- **Use Case:** Remove event from system

### 8. **Publish Event**
- **Endpoint:** `POST /api/events/{eventId}/publish`
- **Protection:** 🔒 Protected (Organizer Auth Required)
- **Purpose:** Change event status from draft to published
- **Response:** `200 OK` with updated event
- **Use Case:** Make event public/active

### 9. **Cancel Event**
- **Endpoint:** `POST /api/events/{eventId}/cancel`
- **Protection:** 🔒 Protected (Organizer Auth Required)
- **Purpose:** Cancel a published event
- **Request Body:**
  ```json
  {
    "reason": "Weather concerns" // optional
  }
  ```
- **Response:** `200 OK` with updated event
- **Use Case:** Cancel event and notify attendees

---

## 🚪 Gate Management Endpoints

### 10. **List Event Gates**
- **Endpoint:** `GET /api/events/{eventId}/gates`
- **Protection:** 🔒 Protected (Organizer Auth Required)
- **Purpose:** Get all gates for an event
- **Response:** Array of gate objects (includes access codes)
- **Use Case:** View all entry points for event

### 11. **Create Gate**
- **Endpoint:** `POST /api/events/{eventId}/gates`
- **Protection:** 🔒 Protected (Organizer Auth Required)
- **Purpose:** Create a new gate for an event
- **Request Body:**
  ```json
  {
    "name": "Main Entrance",
    "accessCode": "ABC123" // optional, auto-generated if not provided
  }
  ```
- **Response:** `201 Created` with gate object
- **Use Case:** Add entry point to event

### 12. **Get Gate Details**
- **Endpoint:** `GET /api/gates/{gateId}`
- **Protection:** 🔒 Protected (Organizer Auth Required)
- **Purpose:** Retrieve specific gate information
- **Response:** Gate object with access code
- **Use Case:** View gate details and access code

### 13. **Update Gate**
- **Endpoint:** `PATCH /api/gates/{gateId}`
- **Protection:** 🔒 Protected (Organizer Auth Required)
- **Purpose:** Update gate name or access code
- **Request Body:**
  ```json
  {
    "name": "VIP Entrance",
    "accessCode": "VIP999"
  }
  ```
- **Response:** `200 OK` with updated gate
- **Use Case:** Modify gate settings

### 14. **Delete Gate**
- **Endpoint:** `DELETE /api/gates/{gateId}`
- **Protection:** 🔒 Protected (Organizer Auth Required)
- **Purpose:** Remove a gate from the event
- **Response:** `200 OK` with success message
- **Use Case:** Delete unused gate

### 15. **Regenerate Access Code**
- **Endpoint:** `POST /api/gates/{gateId}/regenerate-code`
- **Protection:** 🔒 Protected (Organizer Auth Required)
- **Purpose:** Generate new unique access code for gate
- **Query Params:** `?revokeSessions=true` (optional) - Immediately revoke all active gate sessions
- **Request Examples:**
  ```
  # Basic regeneration (existing sessions remain valid for 4 hours)
  POST /api/gates/{gateId}/regenerate-code

  # Regeneration with immediate session revocation (security emergency)
  POST /api/gates/{gateId}/regenerate-code?revokeSessions=true
  ```
- **Response:** `200 OK` with new access code
- **Use Case:**
  - **Without revocation**: Planned access code rotation (operators finish shift gracefully)
  - **With revocation**: Security emergency or compromised code (immediate lockout)
- **Note:** See [GATE_SESSION_REVOCATION.md](GATE_SESSION_REVOCATION.md) for detailed documentation

### 16. **Activate Gate**
- **Endpoint:** `POST /api/gates/{gateId}/activate`
- **Protection:** 🔒 Protected (Organizer Auth Required)
- **Purpose:** Enable gate for check-ins
- **Response:** `200 OK` with updated gate
- **Use Case:** Open gate for event day

### 17. **Deactivate Gate**
- **Endpoint:** `POST /api/gates/{gateId}/deactivate`
- **Protection:** 🔒 Protected (Organizer Auth Required)
- **Purpose:** Disable gate from accepting check-ins
- **Response:** `200 OK` with updated gate
- **Use Case:** Close gate after event or for break

### 18. **Gate Authentication** ⭐
- **Endpoint:** `POST /api/gates/auth`
- **Protection:** 🔓 Public (Anonymous Access)
- **Purpose:** Authenticate to gate using access code (no organizer account needed)
- **Request Body:**
  ```json
  {
    "gateId": "uuid",
    "accessCode": "ABC123"
  }
  ```
- **Response:** `201 Created` with gate session token (valid 4 hours)
- **Use Case:** Gate operator gets access to scan guests

---

## 👥 Guest Management Endpoints

### 19. **List Event Guests**
- **Endpoint:** `GET /api/events/{eventId}/guests`
- **Protection:** 🔒 Protected (Organizer Auth Required)
- **Purpose:** Get all guests for an event
- **Response:** Array of guest objects (contains PII)
- **Use Case:** View attendee list

### 20. **Get Guest Details**
- **Endpoint:** `GET /api/guests/{guestId}`
- **Protection:** 🔒 Protected (Organizer Auth Required)
- **Purpose:** Retrieve specific guest information
- **Response:** Guest object with all details
- **Use Case:** View individual guest profile

### 21. **Add Guest**
- **Endpoint:** `POST /api/events/{eventId}/guests`
- **Protection:** 🔒 Protected (Organizer Auth Required)
- **Purpose:** Add a new guest to the event
- **Request Body:**
  ```json
  {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+15551234567",
    "qrCode": "GUEST-001" // optional, auto-generated if not provided
  }
  ```
- **Response:** `201 Created` with guest object
- **Use Case:** Manually add attendee

### 22. **Update Guest**
- **Endpoint:** `PATCH /api/guests/{guestId}`
- **Protection:** 🔒 Protected (Organizer Auth Required)
- **Purpose:** Update guest information
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "phone": "+15559876543"
  }
  ```
- **Response:** `200 OK` with updated guest
- **Use Case:** Correct guest details

### 23. **Delete Guest**
- **Endpoint:** `DELETE /api/guests/{guestId}`
- **Protection:** 🔒 Protected (Organizer Auth Required)
- **Purpose:** Remove guest from event
- **Response:** `200 OK` with success message
- **Use Case:** Cancel attendance

### 24. **Manual Check-In**
- **Endpoint:** `POST /api/guests/{guestId}/checkin`
- **Protection:** 🔒 Protected (Organizer Auth Required)
- **Purpose:** Manually check in a guest (without scanning)
- **Response:** `200 OK` with updated guest
- **Use Case:** Override when QR code fails

### 25. **Manual Check-Out**
- **Endpoint:** `POST /api/guests/{guestId}/checkout`
- **Protection:** 🔒 Protected (Organizer Auth Required)
- **Purpose:** Manually check out a guest
- **Response:** `200 OK` with updated guest
- **Use Case:** Track guest departure

### 26. **Update RSVP**
- **Endpoint:** `POST /api/guests/{guestId}/rsvp`
- **Protection:** 🔓 Public (Guest Self-Service)
- **Purpose:** Guest confirms attendance (yes/no)
- **Request Body:**
  ```json
  {
    "status": "yes" // or "no"
  }
  ```
- **Response:** `200 OK` with updated guest
- **Use Case:** Guest responds to invitation

---

## 📱 Scanning Endpoint (Public)

### 27. **Scan Guest QR Code** ⭐
- **Endpoint:** `POST /api/scan`
- **Protection:** 🔓 Public (Requires Gate Session Token)
- **Purpose:** Scan guest QR code at gate (automatic check-in)
- **Headers:** `Authorization: Bearer {gateSessionToken}`
- **Request Body:**
  ```json
  {
    "qrCode": "GUEST-001"
  }
  ```
- **Response:** `201 Created` with scan record + guest info
- **Use Case:** Gate operator scans guest for entry
- **Notes:** Creates scan record and automatically checks in guest

---

## 📊 Scan History Endpoints (Protected)

### 28. **Event Scan History**
- **Endpoint:** `GET /api/events/{eventId}/scans`
- **Protection:** 🔒 Protected (Organizer Auth Required)
- **Purpose:** View all scans for an event
- **Response:** Array of scan records with timestamps, gates, guests
- **Use Case:** Event attendance analytics

### 29. **Gate Scan History**
- **Endpoint:** `GET /api/gates/{gateId}/scans`
- **Protection:** 🔒 Protected (Organizer Auth Required)
- **Purpose:** View all scans at a specific gate
- **Response:** Array of scan records for that gate
- **Use Case:** Gate-specific traffic analysis

### 30. **Guest Scan History**
- **Endpoint:** `GET /api/guests/{guestId}/scans`
- **Protection:** 🔒 Protected (Organizer Auth Required)
- **Purpose:** View all scans for a specific guest
- **Response:** Array of scan records (entry/re-entry times)
- **Use Case:** Track individual guest movement

---

## 📈 Summary Statistics

### Endpoint Breakdown
| Category | Count | Protected | Public |
|----------|-------|-----------|--------|
| **Authentication** | 2 | 0 | 2 |
| **Event Management** | 7 | 7 | 0 |
| **Gate Management** | 9 | 8 | 1 |
| **Guest Management** | 8 | 7 | 1 |
| **Scanning** | 1 | 0 | 1 |
| **Scan History** | 3 | 3 | 0 |
| **TOTAL** | **30** | **25** | **5** |

---

## 🔑 Authentication Types

### 1. **Organizer Authentication** (Bearer Token)
- Used for: All protected endpoints (25 endpoints)
- Token obtained from: `POST /api/auth/signin` or `POST /api/auth/signup`
- Header format: `Authorization: Bearer {accessToken}`
- Token lifespan: Session-based (managed by Supabase)

### 2. **Gate Session Authentication** (Bearer Token)
- Used for: `POST /api/scan` endpoint only
- Token obtained from: `POST /api/gates/auth`
- Header format: `Authorization: Bearer {gateSessionToken}`
- Token lifespan: 4 hours
- Special: Works without organizer account (anonymous operators)

### 3. **No Authentication Required**
- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `POST /api/gates/auth`
- `POST /api/scan` (requires gate session token)
- `POST /api/guests/{id}/rsvp`

---

## 🛡️ Security Features

### ✅ Implemented
1. **Authentication:** All organizer operations require valid token
2. **Input Sanitization:** XSS protection on all text fields
3. **Phone Validation:** Must be 10-15 digits
4. **Email Validation:** Format checking + normalization
5. **String Length Limits:** Prevent DoS attacks
6. **PII Protection:** Guest data only accessible with auth
7. **Access Code Protection:** Gate codes only accessible with auth

### 🔒 Data Protection
- **Guest PII** (name, email, phone): Protected - organizer auth required
- **Gate Access Codes**: Protected - organizer auth required
- **Scan History**: Protected - organizer auth required
- **Event Details**: Protected - organizer auth required

---

## 🎯 Common Workflows

### Workflow 1: Event Creation & Management
```
1. POST /api/auth/signin (get organizer token)
2. POST /api/events (create draft event)
3. POST /api/events/{id}/gates (add Main Gate)
4. POST /api/events/{id}/gates (add VIP Gate)
5. POST /api/events/{id}/guests (add attendees)
6. POST /api/events/{id}/publish (go live)
```

### Workflow 2: Gate Operation (Event Day)
```
1. POST /api/gates/auth (gate operator authenticates with access code)
2. POST /api/scan (scan guest QR code - auto check-in)
3. POST /api/scan (scan next guest)
4. ... repeat for all guests
```

### Workflow 3: Post-Event Analytics
```
1. GET /api/events/{id}/scans (view all scans)
2. GET /api/gates/{id}/scans (analyze gate traffic)
3. GET /api/guests/{id}/scans (check individual attendance)
```

---

## 📄 Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

### Common Error Codes
- `AUTH_REQUIRED` - 401: No authentication token provided
- `INVALID_REQUEST` - 400: Malformed request body
- `VALIDATION_ERROR` - 400: Invalid input data
- `NOT_FOUND` - 404: Resource doesn't exist
- `INTERNAL_ERROR` - 500: Server error

---

## ✨ Next Steps

Ready for:
- ✅ Development
- ✅ Testing
- ✅ MVP Launch

Consider adding:
- ⏳ Rate limiting
- ⏳ Audit logging
- ⏳ Email notifications
- ⏳ QR code generation API
- ⏳ Analytics dashboard endpoint
