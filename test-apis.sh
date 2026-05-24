#!/bin/bash

# Test all API endpoints after deployment
# Usage: ./test-apis.sh [domain]
# Example: ./test-apis.sh lagerbank.info

DOMAIN="${1:-lagerbank.info}"
API_URL="https://${DOMAIN}/api"
ADMIN_EMAIL="admin@${DOMAIN}"
ADMIN_PASS="Bula2026!"

echo "🧪 Testing BULA2026 API Endpoints..."
echo ""

# Test health check
echo "1️⃣  Testing Health Check..."
curl -s $API_URL/health | jq . || echo "❌ Health check failed"
echo ""

# Test login
echo "2️⃣  Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}")

echo $LOGIN_RESPONSE | jq .
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token // empty')

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed - no token received"
  exit 1
fi

echo "✅ Token received: ${TOKEN:0:20}..."
echo ""

# Test participants
echo "3️⃣  Testing Participants API..."
curl -s $API_URL/participants/?camp_id=1 \
  -H "Authorization: Bearer $TOKEN" | jq 'length' || echo "❌ Failed"
echo ""

# Test tents
echo "4️⃣  Testing Tents API..."
curl -s $API_URL/tents/?camp_id=1 \
  -H "Authorization: Bearer $TOKEN" | jq 'length' || echo "❌ Failed"
echo ""

# Test activities
echo "5️⃣  Testing Activities API..."
curl -s $API_URL/activities/?camp_id=1 \
  -H "Authorization: Bearer $TOKEN" | jq 'length' || echo "❌ Failed"
echo ""

# Test registrations
echo "6️⃣  Testing Registrations API..."
curl -s $API_URL/registrations/camp/1 \
  -H "Authorization: Bearer $TOKEN" | jq '.registrations | length' || echo "❌ Failed"
echo ""

# Test photos
echo "7️⃣  Testing Photos API..."
curl -s $API_URL/photos/?camp_id=1 \
  -H "Authorization: Bearer $TOKEN" | jq 'length' || echo "❌ Failed"
echo ""

# Test pocket money
echo "8️⃣  Testing Pocket Money API..."
curl -s $API_URL/pocket-money/camp/1/balance \
  -H "Authorization: Bearer $TOKEN" | jq . || echo "❌ Failed"
echo ""

# Test check-in
echo "9️⃣  Testing Check-in API..."
curl -s $API_URL/check-in/status/1 \
  -H "Authorization: Bearer $TOKEN" | jq . || echo "❌ Failed"
echo ""

echo "✅ API Testing Complete!"
