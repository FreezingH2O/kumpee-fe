#!/usr/bin/env bash
# Creates the `kh_` API key used for the signed-out free AI trial
# (KAMPHEE_GUEST_API_TOKEN). Run from the kumpee-fe-main folder:
#
#   bash scripts/create-guest-key.sh
#
# It signs in to Supabase with an account you already registered on the site,
# then asks the backend for a key with only the `language:use` scope.
# Your password is read silently and never saved.
set -euo pipefail

SUPABASE_URL="https://ywbvftgqxttodiybvhvs.supabase.co"
API_BASE="https://kumpee-be.vercel.app"

cd "$(dirname "$0")/.."
ANON_KEY="$(grep -E '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' .env.local 2>/dev/null | cut -d= -f2- | tr -d '"' || true)"
if [ -z "$ANON_KEY" ]; then
  read -r -p "Supabase anon key (NEXT_PUBLIC_SUPABASE_ANON_KEY): " ANON_KEY
fi

read -r -p "Email of your คำภีร์ account: " EMAIL
read -r -s -p "Password: " PASSWORD
echo

LOGIN_BODY="$(EMAIL="$EMAIL" PASSWORD="$PASSWORD" python3 -c 'import json,os; print(json.dumps({"email": os.environ["EMAIL"], "password": os.environ["PASSWORD"]}))')"
LOGIN="$(curl -s "$SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $ANON_KEY" -H "content-type: application/json" -d "$LOGIN_BODY")"

JWT="$(printf '%s' "$LOGIN" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("access_token",""))')"
if [ -z "$JWT" ]; then
  echo "❌ Sign-in failed:"
  printf '%s' "$LOGIN" | python3 -c 'import json,sys; d=json.load(sys.stdin); print("  ", d.get("msg") or d.get("error_description") or d.get("message") or d)'
  echo "   Check the email/password, and that the account's email is confirmed."
  exit 1
fi
echo "✅ Signed in."

RESULT="$(curl -s -X POST "$API_BASE/v1/api-keys" \
  -H "authorization: Bearer $JWT" -H "content-type: application/json" \
  -d '{"name":"kumpee-fe guest trial","scopes":["language:use"]}')"

SECRET="$(printf '%s' "$RESULT" | python3 -c 'import json,sys; print((json.load(sys.stdin).get("data") or {}).get("secret",""))')"
if [ -z "$SECRET" ]; then
  echo "❌ The backend did not create a key:"
  echo "   $RESULT"
  exit 1
fi

echo
echo "✅ Guest API key created. It is shown ONLY NOW — copy it:"
echo
echo "   KAMPHEE_GUEST_API_TOKEN=$SECRET"
echo
echo "Put this value in Vercel (Settings → Environment Variables) and, for local"
echo "testing, in .env.local. Then redeploy / restart npm run dev."
