#!/bin/bash

# Load environment variables from .env
set -a
source .env
set +a

CSV_FILE="discounts.csv"

echo "Processing $CSV_FILE..."

tail -n +2 "$CSV_FILE" | while IFS=, read -r code discount_type discount_value max_redemptions valid_from valid_until ticket_type_ids; do
  code=$(echo "$code" | tr -d '[:space:]')
  discount_type=$(echo "$discount_type" | tr -d '[:space:]' | tr '[:upper:]' '[:lower:]')

  if [ -z "$code" ] || [ -z "$discount_type" ]; then
    echo "Skipping invalid row"
    continue
  fi

  # Build curl args
  args=(-s -X POST 'https://api.tickettailor.com/v1/discounts')
  args+=(-u "${TICKET_TAILOR_API_KEY}:")
  args+=(-H 'Accept: application/json')
  args+=(-d "code=$code")

  if [ "$discount_type" = "percentage" ]; then
    pct=$(echo "$discount_value" | tr -d '[:space:]')
    args+=(-d "type=percentage" -d "price_percent=$pct")
  elif [ "$discount_type" = "fixed" ]; then
    val=$(echo "$discount_value" | tr -d '[:space:]')
    price_cents=$(echo "$val * 100" | bc | cut -d. -f1)
    args+=(-d "type=fixed_amount" -d "price=$price_cents")
  else
    echo "Unknown discount_type '$discount_type' for $code, skipping"
    continue
  fi

  max_r=$(echo "$max_redemptions" | tr -d '[:space:]')
  if [ -n "$max_r" ]; then
    args+=(-d "max_redemptions=$max_r")
  fi

  # Add each ticket type (pipeline runs in subshell so collect into array first)
  IFS=',' read -ra ticket_ids <<< "$ticket_type_ids"
  for tid in "${ticket_ids[@]}"; do
    tid=$(echo "$tid" | tr -d '[:space:]')
    [ -n "$tid" ] && args+=(-d "ticket_types[]=$tid")
  done

  echo ""
  echo "Sending ($code)..."
  curl "${args[@]}" | jq .
  echo "---"
done

echo ""
echo "Done."
