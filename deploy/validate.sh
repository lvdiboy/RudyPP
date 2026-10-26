#!/bin/bash
set -euo pipefail
# CodeDeploy ValidateService: the deployment only succeeds if the app is healthy AND serves the UI.
# Port 9333; APIs under /api (actuator base path /api/actuator), the React UI at / (see application.yaml).
# RUDYPP_VALIDATE_URL overrides the base URL for local testing only; CodeDeploy leaves it unset.
BASE_URL="${RUDYPP_VALIDATE_URL:-http://127.0.0.1:9333}"
HEALTH_URL="$BASE_URL/api/actuator/health"
status=none
body=

healthy=false
for attempt in $(seq 1 30); do
    if systemctl is-active --quiet rudypp.service; then
        # 200 = UP, 503 = DOWN (MySQL or Redis unreachable), 000 = not listening yet
        response=$(curl --silent --show-error --max-time 3 --write-out '\n%{http_code}' "$HEALTH_URL" 2>&1 || true)
        status=${response##*$'\n'}
        body=${response%$'\n'*}
        if [ "$status" = 200 ]; then
            healthy=true
            break
        fi
    fi
    sleep 2
done

if [ "$healthy" != true ]; then
    echo "Health check failed: $HEALTH_URL returned HTTP $status: $body"
    # A leftover SERVER_SERVLET_CONTEXT_PATH=/api in the service environment moves everything to /api/api/...
    if curl --silent --fail --max-time 3 "$BASE_URL/api/api/actuator/health" > /dev/null 2>&1; then
        echo "Hint: the app answers on /api/api/actuator/health. Remove SERVER_SERVLET_CONTEXT_PATH from the"
        echo "      service environment (e.g. /etc/rudypp/rudypp.env); the /api prefix is now set in the code."
    fi
    systemctl status rudypp.service --no-pager || true
    journalctl -u rudypp.service -n 80 --no-pager || true
    exit 1
fi

# The React UI is built into the jar: the home page and a client route (forwarded to index.html)
# must both return the app shell, not an error page
page=$(mktemp)
trap 'rm -f "$page"' EXIT
for path in / /dashboard; do
    code=$(curl --silent --max-time 5 --output "$page" --write-out '%{http_code}' "$BASE_URL$path" || true)
    if [ "$code" != 200 ] || ! grep -q 'id="root"' "$page"; then
        echo "UI check failed: $BASE_URL$path returned HTTP $code without the React app shell."
        echo "The jar may have been built without the UI (see the Jenkins Package stage)."
        exit 1
    fi
done
echo "Validated: $HEALTH_URL is UP and the UI is served at / and /dashboard"
