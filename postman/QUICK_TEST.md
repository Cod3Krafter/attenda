# Quick E2E Test (5 Minutes)

## 🚀 Fastest Way to Test Everything

Run these requests **in order** in Postman:

### 1️⃣ Setup (30 seconds)
```
✅ Sign In
✅ Create Event
✅ Create Gate
✅ Add Guest
```

### 2️⃣ Gate Flow (30 seconds)
```
✅ Gate Authentication (Public)
✅ Scan Guest
```

### 3️⃣ Verify (30 seconds)
```
✅ Get Event Scans
✅ Get Guest Scan History
✅ List Event Guests
```

---

## ✅ Quick Validation Checklist

After running, verify in **Postman Console**:

- [ ] `accessToken` saved ✅
- [ ] `eventId` saved ✅
- [ ] `gateId` + `accessCode` saved ✅
- [ ] `guestId` saved ✅
- [ ] `gateSessionToken` saved ✅
- [ ] Guest `checkedIn: true` ✅
- [ ] Scan `result: "success"` ✅

---

## 📊 Expected Results

**After Sign In:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "..." },
    "organizer": { "id": "...", "role": "owner" },
    "session": { "access_token": "..." }
  }
}
```

**After Create Event:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "title": "...",
    "status": "draft"
  }
}
```

**After Create Gate:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "accessCode": "ABC123",
    "isActive": true
  }
}
```

**After Gate Auth:**
```json
{
  "success": true,
  "data": {
    "gateSessionToken": "eyJ...",
    "expiresIn": 14400
  }
}
```

**After Scan:**
```json
{
  "success": true,
  "data": {
    "scan": { "result": "success" },
    "guest": { "checkedIn": true }
  }
}
```

---

## 🎯 Success = All Green ✅

If all requests return `200/201` and environment variables are populated, **your backend is working perfectly!**

---

## 🐛 If Something Fails

1. Check server logs (`pnpm dev` terminal)
2. Verify environment variables in Postman
3. Check Supabase database for data
4. Review [E2E_TEST_FLOW.md](./E2E_TEST_FLOW.md) for detailed troubleshooting
