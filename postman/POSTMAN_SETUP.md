# Postman Setup Guide for Attenda API

This guide will help you set up and test the Attenda API using Postman.

## 📦 What's Included

- **Collection**: `Attenda_API.postman_collection.json` - All 32 API endpoints organized by resource
- **Environment**: `Attenda_Local.postman_environment.json` - Variables for local testing

## 🚀 Quick Setup

### Step 1: Import Collection

1. Open Postman
2. Click **Import** (top left)
3. Drag and drop or select: `Attenda_API.postman_collection.json`
4. Click **Import**

### Step 2: Import Environment

1. Click **Environments** (left sidebar)
2. Click **Import**
3. Select: `Attenda_Local.postman_environment.json`
4. Click **Import**

### Step 3: Activate Environment

1. Select **"Attenda - Local"** from the environment dropdown (top right)
2. Verify `baseUrl` is set to `http://localhost:3000`

### Step 4: Verify Server is Running

Make sure your dev server is running:
```bash
pnpm dev
```

Server should be at: `http://localhost:3000`

---

## 🎯 Testing Workflow

### Complete Flow (Recommended Order)

Follow this order for a smooth testing experience:

#### 1️⃣ Authentication
```
1. Sign Up          → Auto-saves accessToken and organizerId
2. Sign In          → Use if you already have an account
3. Get Session      → Verify authentication works
```

#### 2️⃣ Create Event
```
4. Create Event     → Auto-saves eventId
5. Get Event        → Verify event was created
6. Publish Event    → Make event active
```

#### 3️⃣ Add Guests
```
7. Add Guest        → Auto-saves guestId
8. List Guests      → See all guests for event
9. Update RSVP      → Set RSVP to "yes"
```

#### 4️⃣ Setup Gates
```
10. Create Gate     → Auto-saves gateId and accessCode
11. List Gates      → Verify gate was created
```

#### 5️⃣ Scan Flow
```
12. Scan Guest      → Record check-in (auto check-in guest)
13. Get Event Scans → Verify scan was recorded
```

---

## 🔑 Environment Variables (Auto-Populated)

The collection automatically saves these variables:

| Variable | Saved By | Used By |
|----------|----------|---------|
| `accessToken` | Sign Up / Sign In | All authenticated requests |
| `organizerId` | Sign Up | Create Event |
| `eventId` | Create Event | Add Guest, Create Gate, etc. |
| `guestId` | Add Guest | Update RSVP, Check In, Scan |
| `gateId` | Create Gate | Scan, Gate operations |
| `accessCode` | Create Gate | Reference only |

---

## 📝 Request Details

### Authentication

#### Sign Up
- **Automatically saves**: `accessToken`, `organizerId`, `authUserId`
- **Edit email** in request body to use a unique email
- **Note**: Supabase may require email verification (check settings)

#### Sign In
- **Automatically saves**: `accessToken`, `organizerId`
- Use this after creating an account via Supabase dashboard

### Events

#### Create Event
- **Automatically saves**: `eventId`
- Uses `{{organizerId}}` from environment
- **Must be authenticated** (uses `{{accessToken}}`)

#### Publish Event
- Event must have `startDate`, `endDate`, and `venue`
- Changes status from `draft` → `published`

### Guests

#### Add Guest
- **Automatically saves**: `guestId`
- Uses `{{eventId}}` from environment
- Default RSVP status is `pending`

#### Update RSVP
- Status must be `"yes"` or `"no"`
- Changes from `pending` to confirmed status

### Gates

#### Create Gate (Auto-Generate)
- **Automatically saves**: `gateId`, `accessCode`
- System generates 6-character alphanumeric code (e.g., `A3X9K2`)

#### Create Gate (Custom Code)
- Provide your own `accessCode` (e.g., `VIP2025`)
- Must be unique across all gates

#### Regenerate Access Code
- Creates new random code
- Useful if code is compromised

### Scanning

#### Scan Guest
- **Validates**: Gate is active, Guest belongs to event, RSVP status
- **Auto check-in**: If validation passes
- **Returns**: Detailed scan result with guest and gate info

**Result Types:**
- `success` - Guest checked in
- `denied` - Gate inactive or RSVP "no"
- `invalid` - Guest/Gate doesn't belong to event

---

## 🔍 Testing Tips

### 1. Use Console to See Saved Variables

After running requests, check Postman Console (bottom left):
```
✅ Signup successful! Token and IDs saved.
✅ Event created! ID: event-123
✅ Gate created! Code: A3X9K2
```

### 2. View Environment Variables

Click the eye icon (👁️) next to environment dropdown to see:
- Current variable values
- What was auto-saved

### 3. Manual Variable Edit

If auto-save fails or you need to test with specific IDs:
1. Click environment dropdown
2. Select **Edit** next to "Attenda - Local"
3. Update variable values manually

### 4. Test Error Cases

Try these scenarios:
- Sign up with existing email → `409 Conflict`
- Create event with invalid organizerId → `404 Not Found`
- Create gate with duplicate accessCode → `409 Conflict`
- Scan guest at inactive gate → Result: `denied`
- Check out guest who hasn't checked in → Error

### 5. Reset Between Tests

To start fresh:
1. Delete test data from Supabase dashboard
2. Clear environment variables (or just change email)
3. Run Sign Up again

---

## 🐛 Troubleshooting

### "Email is invalid" Error
**Cause**: Supabase email validation settings
**Solution**:
- Option 1: Use Supabase Dashboard to create user manually
- Option 2: Disable email confirmation in Supabase settings:
  - Go to: Authentication → Providers → Email
  - Turn off "Confirm email"

### "Unauthorized" Error
**Cause**: Missing or expired access token
**Solution**:
- Re-run Sign In request
- Check `accessToken` is saved in environment
- Verify `Authorization` header is: `Bearer {{accessToken}}`

### "Organizer not found" Error
**Cause**: organizerId doesn't exist in database
**Solution**:
- Run Sign Up to create new organizer
- Verify organizerId was saved correctly

### Variables Not Auto-Saving
**Cause**: Test scripts not running
**Solution**:
- Check Tests tab in request
- Verify environment is selected (top right)
- Run request again

### Server Not Responding
**Cause**: Dev server not running
**Solution**:
```bash
pnpm dev
```
Verify server is at `http://localhost:3000`

---

## 📊 Collection Structure

```
Attenda API/
├── Authentication/
│   ├── Sign Up
│   ├── Sign In
│   ├── Get Session
│   └── Sign Out
│
├── Events/
│   ├── Create Event
│   ├── Get Event
│   ├── List Events
│   ├── Update Event
│   ├── Publish Event
│   ├── Cancel Event
│   └── Delete Event
│
├── Guests/
│   ├── Add Guest to Event
│   ├── List Event Guests
│   ├── Get Guest
│   ├── Update Guest
│   ├── Update RSVP
│   ├── Check In Guest
│   ├── Check Out Guest
│   └── Delete Guest
│
├── Gates/
│   ├── Create Gate (Auto-Generate)
│   ├── Create Gate (Custom Code)
│   ├── List Event Gates
│   ├── Get Gate
│   ├── Update Gate
│   ├── Regenerate Access Code
│   ├── Activate Gate
│   ├── Deactivate Gate
│   └── Delete Gate
│
└── Scanning/
    ├── Scan Guest (Check-In)
    ├── Get Event Scans
    ├── Get Guest Scan History
    └── Get Gate Scan History
```

---

## 🎓 Example Test Scenario

### Complete Event Setup Flow

```
1. Sign Up
   POST /api/auth/signup
   → Saves: accessToken, organizerId

2. Create Event
   POST /api/events
   Body: { organizerId: "{{organizerId}}", title: "My Event", ... }
   → Saves: eventId

3. Publish Event
   POST /api/events/{{eventId}}/publish
   → Event status: "published"

4. Add 3 Guests
   POST /api/events/{{eventId}}/guests
   Body: { name: "Guest 1", ... }
   → Saves: guestId (for last guest)

5. Update Guest RSVP
   POST /api/guests/{{guestId}}/rsvp
   Body: { status: "yes" }
   → RSVP confirmed

6. Create Main Gate
   POST /api/events/{{eventId}}/gates
   Body: { name: "Main Entrance" }
   → Saves: gateId, accessCode (e.g., "A3X9K2")

7. Scan Guest
   POST /api/scan
   Body: { guestId, gateId, eventId, scanData: "QR123" }
   → Result: "success", Guest auto checked-in

8. View Scans
   GET /api/events/{{eventId}}/scans
   → See all check-ins
```

---

## 🚀 Next Steps

After testing API:
1. ✅ Verify all endpoints work
2. 📝 Note any bugs or improvements
3. 🎨 Build UI components
4. 📋 Add bulk guest upload feature
5. 🔒 Add authentication middleware

---

## 📞 Support

If you encounter issues:
1. Check server logs in terminal
2. Check Postman Console for errors
3. Verify Supabase connection in `.env.local`
4. Review API Testing Guide: `API_TESTING_GUIDE.md`

Happy Testing! 🎉
