#!/bin/bash
set -euo pipefail
# Spring Boot Actuator health check (port 9333, context path /api, see application.yaml)
URL="http://127.0.0.1:9333/api/actuator/health"
status=none
body=
for attempt in $(seq 1 30); do
    if systemctl is-active --quiet rudypp.service; then
        # 200 = UP, 503 = DOWN (MySQL or Redis unreachable), 000 = not listening yet
        response=$(curl --silent --show-error --max-time 3 --write-out '\n%{http_code}' "$URL" 2>&1 || true)
        status=${response##*$'\n'}
        body=${response%$'\n'*}
        if [ "$status" = 200 ]; then
            exit 0
        fi
    fi
    sleep 2
done
echo "Health check failed: $URL returned HTTP $status: $body"
systemctl status rudypp.service --no-pager || true
journalctl -u rudypp.service -n 80 --no-pager || true
exit 1
