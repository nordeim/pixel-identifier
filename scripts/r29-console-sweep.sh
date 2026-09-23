#!/bin/bash
# R29 console-error sweep across all clone routes (standing loop)
ROUTES=(
  "/",
  "/about", "/blog", "/docs", "/privacy", "/terms", "/gdpr", "/ccpa",
  "/login", "/signup", "/forgot-password",
  "/dashboard", "/dashboard/visitors", "/dashboard/activity",
  "/dashboard/install", "/dashboard/domains", "/dashboard/pricing",
  "/dashboard/settings", "/nonexistent-page-404"
)
TOTAL=0; ERRORS=0
for r in "${ROUTES[@]}"; do
  TOTAL=$((TOTAL+1))
  agent-browser --session clone open "http://localhost:3000$r" > /dev/null 2>&1
  sleep 1.2
  RAW_ERRORS=$(agent-browser --session clone errors 2>/dev/null)
  RAW_CONSOLE=$(agent-browser --session clone console 2>/dev/null)
  ERR_COUNT=$(echo "$RAW_ERRORS" | grep -c "Error" || true)
  CONSOLE_ERR=$(echo "$RAW_CONSOLE" | grep -ci "error" || true)
  if [ "$ERR_COUNT" -gt 0 ] || [ "$CONSOLE_ERR" -gt 0 ]; then
    ERRORS=$((ERRORS+1))
    echo "ERRORS on $r:"
    echo "$RAW_ERRORS" | head -5
    echo "$RAW_CONSOLE" | grep -i "error" | head -5
  fi
  agent-browser --session clone errors --clear > /dev/null 2>&1
  agent-browser --session clone console --clear > /dev/null 2>&1
  echo "swept $r"
done
echo "=== SWEEP DONE: $TOTAL routes, $ERRORS with errors ==="
