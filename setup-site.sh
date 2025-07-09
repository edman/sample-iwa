#!/bin/bash
# This script creates a new site in Firebase Hosting and configures it in
# firebase.json.
#
# It does nothing if firebase.json already has a site configured.
set -euo pipefail

log() {
  gum log --time=kitchen --structured --level "$@"
}

log info "Checking if a site is already configured in firebase.json"

EXISTING_SITE=$(jq -r '.hosting.site' firebase.json)

if [ "$EXISTING_SITE" != "your-site" ] && [ "$EXISTING_SITE" != "null" ]; then
  log info "Done, site already configured" EXISTING_SITE "$EXISTING_SITE"
  exit 0
fi

log info "Creating site with firebase CLI (takes a few seconds to start, please wait)"

OUTPUT=$(firebase hosting:sites:create 2>&1 | tee /dev/tty)
RESULT_CODE=$?
if [ $RESULT_CODE -ne 0 ]; then
  log error "Failed to create site, see firebase output above"
  exit $RESULT_CODE
fi

log info "Parsing site from firebase output"

SITE_NAME=$(sed -n 's/.*Site \([^ ]*\) has been created.*/\1/p' <<< "$OUTPUT")
if [ -z "$SITE_NAME" ]; then
  log error "Failed to parse the site name from firebase output"
  exit 102
fi

log info "Confirming site" SITE_NAME $SITE_NAME

if ! gum confirm "Configure site $SITE_NAME.web.app in firebase.json?"; then
  log error "Site not configured in firebase.json"
  exit 103
fi

log info 'Updating "site" in firebase.json'

TMP="/tmp/temp_firebase.json"
jq ".hosting.site = \"$SITE_NAME\"" firebase.json > $TMP && mv $TMP firebase.json

log info "Done, configured site http://$SITE_NAME.web.app"
