#!/bin/bash
set -euo pipefail
test -x /usr/bin/java
command -v curl >/dev/null
id rudypp >/dev/null
systemctl cat rudypp.service >/dev/null
# ApplicationStop is skipped on the first deployment.
systemctl stop rudypp.service
install -d -o rudypp -g rudypp -m 750 /opt/rudypp/app
