#!/bin/bash

# Attenda API Test Script
# Tests the complete flow: signup → event creation → guest management → scanning

set -e  # Exit on error

BASE_URL="http://localhost:3000"
EMAIL="test-$(date +%s)@example.com"  # Unique email for each test
PASSWORD="TestPass123"

echo "🧪 Starting Attenda API Tests..."
echo "================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Sign Up
echo "📝 Test 1: Sign Up"
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"name\": \"Test Organizer\",
    \"role\": \"owner\"
  }")

echo "$SIGNUP_RESPONSE" | jq .

# Extract data
ACCESS_TOKEN=$(echo "$SIGNUP_RESPONSE" | jq -r '.data.session.access_token')
ORGANIZER_ID=$(echo "$SIGNUP_RESPONSE" | jq -r '.data.organizer.id')

if [ "$ACCESS_TOKEN" != "null" ]; then
  echo -e "${GREEN}✓ Sign up successful${NC}"
else
  echo -e "${RED}✗ Sign up failed${NC}"
  exit 1
fi
echo ""

# Test 2: Sign In
echo "🔐 Test 2: Sign In"
SIGNIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/signin" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

echo "$SIGNIN_RESPONSE" | jq .

if echo "$SIGNIN_RESPONSE" | jq -e '.success' > /dev/null; then
  echo -e "${GREEN}✓ Sign in successful${NC}"
else
  echo -e "${RED}✗ Sign in failed${NC}"
  exit 1
fi
echo ""

# Test 3: Create Event
echo "🎉 Test 3: Create Event"
EVENT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"organizerId\": \"$ORGANIZER_ID\",
    \"title\": \"Test Conference 2025\",
    \"description\": \"Testing event creation\",
    \"venue\": \"Test Venue\",
    \"startDate\": \"2025-06-01T09:00:00Z\",
    \"endDate\": \"2025-06-03T18:00:00Z\"
  }")

echo "$EVENT_RESPONSE" | jq .

EVENT_ID=$(echo "$EVENT_RESPONSE" | jq -r '.data.id')

if [ "$EVENT_ID" != "null" ]; then
  echo -e "${GREEN}✓ Event created${NC}"
else
  echo -e "${RED}✗ Event creation failed${NC}"
  exit 1
fi
echo ""

# Test 4: Publish Event
echo "📣 Test 4: Publish Event"
PUBLISH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/events/$EVENT_ID/publish" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "$PUBLISH_RESPONSE" | jq .

if echo "$PUBLISH_RESPONSE" | jq -e '.success' > /dev/null; then
  echo -e "${GREEN}✓ Event published${NC}"
else
  echo -e "${RED}✗ Event publish failed${NC}"
  exit 1
fi
echo ""

# Test 5: Add Guest
echo "👤 Test 5: Add Guest"
GUEST_RESPONSE=$(curl -s -X POST "$BASE_URL/api/events/$EVENT_ID/guests" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"John Doe\",
    \"email\": \"john@example.com\",
    \"phone\": \"+1234567890\"
  }")

echo "$GUEST_RESPONSE" | jq .

GUEST_ID=$(echo "$GUEST_RESPONSE" | jq -r '.data.id')

if [ "$GUEST_ID" != "null" ]; then
  echo -e "${GREEN}✓ Guest added${NC}"
else
  echo -e "${RED}✗ Guest creation failed${NC}"
  exit 1
fi
echo ""

# Test 6: Update RSVP
echo "✉️ Test 6: Update Guest RSVP"
RSVP_RESPONSE=$(curl -s -X POST "$BASE_URL/api/guests/$GUEST_ID/rsvp" \
  -H "Content-Type: application/json" \
  -d "{
    \"status\": \"yes\"
  }")

echo "$RSVP_RESPONSE" | jq .

if echo "$RSVP_RESPONSE" | jq -e '.success' > /dev/null; then
  echo -e "${GREEN}✓ RSVP updated${NC}"
else
  echo -e "${RED}✗ RSVP update failed${NC}"
  exit 1
fi
echo ""

# Test 7: Create Gate (Auto-generate code)
echo "🚪 Test 7: Create Gate with Auto-Generated Code"
GATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/events/$EVENT_ID/gates" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Main Entrance\"
  }")

echo "$GATE_RESPONSE" | jq .

GATE_ID=$(echo "$GATE_RESPONSE" | jq -r '.data.id')
ACCESS_CODE=$(echo "$GATE_RESPONSE" | jq -r '.data.accessCode')

if [ "$GATE_ID" != "null" ] && [ "$ACCESS_CODE" != "null" ]; then
  echo -e "${GREEN}✓ Gate created with code: $ACCESS_CODE${NC}"
else
  echo -e "${RED}✗ Gate creation failed${NC}"
  exit 1
fi
echo ""

# Test 8: Scan Guest (Check-in)
echo "📱 Test 8: Scan Guest at Gate"
SCAN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/scan" \
  -H "Content-Type: application/json" \
  -d "{
    \"guestId\": \"$GUEST_ID\",
    \"gateId\": \"$GATE_ID\",
    \"eventId\": \"$EVENT_ID\",
    \"scanData\": \"TEST_QR_CODE_123\"
  }")

echo "$SCAN_RESPONSE" | jq .

SCAN_RESULT=$(echo "$SCAN_RESPONSE" | jq -r '.data.scan.result')
CHECKED_IN=$(echo "$SCAN_RESPONSE" | jq -r '.data.guest.checkedIn')

if [ "$SCAN_RESULT" == "success" ] && [ "$CHECKED_IN" == "true" ]; then
  echo -e "${GREEN}✓ Guest scanned and checked in successfully${NC}"
else
  echo -e "${RED}✗ Scan failed or guest not checked in${NC}"
  exit 1
fi
echo ""

# Test 9: Verify Scan History
echo "📊 Test 9: Get Scan History"
SCANS_RESPONSE=$(curl -s "$BASE_URL/api/events/$EVENT_ID/scans")

echo "$SCANS_RESPONSE" | jq .

SCAN_COUNT=$(echo "$SCANS_RESPONSE" | jq '.data | length')

if [ "$SCAN_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✓ Scan history retrieved (${SCAN_COUNT} scans)${NC}"
else
  echo -e "${RED}✗ No scans found${NC}"
  exit 1
fi
echo ""

# Summary
echo "================================="
echo -e "${GREEN}✅ All tests passed!${NC}"
echo ""
echo "Test Data:"
echo "  Email: $EMAIL"
echo "  Organizer ID: $ORGANIZER_ID"
echo "  Event ID: $EVENT_ID"
echo "  Guest ID: $GUEST_ID"
echo "  Gate ID: $GATE_ID"
echo "  Access Code: $ACCESS_CODE"
echo ""
echo "🎉 API is working correctly!"
