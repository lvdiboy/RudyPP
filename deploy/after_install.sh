#!/bin/bash
set -euo pipefail
# Same path as ExecStart in rudypp.service
chown rudypp:rudypp /opt/rudypp/app/rudypp.jar
chmod 640 /opt/rudypp/app/rudypp.jar
systemctl daemon-reload
