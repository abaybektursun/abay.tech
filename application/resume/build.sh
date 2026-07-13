#!/usr/bin/env bash
# Render resume.html -> resume.pdf with the local headless Chrome. Zero dependencies.
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PROFILE_DIR="$(mktemp -d "${TMPDIR:-/tmp}/chrome-resume-build.XXXXXX")"
trap 'rm -rf "$PROFILE_DIR"' EXIT
"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
  --virtual-time-budget=9000 --user-data-dir="$PROFILE_DIR" \
  --print-to-pdf="$DIR/resume.pdf" "file://$DIR/resume.html" >/dev/null 2>&1
echo "wrote $DIR/resume.pdf"
