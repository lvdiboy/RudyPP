#!/bin/bash
set -euo pipefail
if systemctl cat rudypp.service >/dev/null 2>&1; then
    systemctl stop rudypp.service
fi
