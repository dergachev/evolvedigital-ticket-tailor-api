# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

Scripts for bulk-creating discount codes in TicketTailor via their REST API. Reads from a CSV file and POSTs each row as a discount to `https://api.tickettailor.com/v1/discounts`.

## Setup

Copy `.env.example` or create `.env` with:
```
TICKET_TAILOR_API_KEY=sk_...
```

Install dependencies:
```
npm install
```

## Running

The main script is `bulk2.js` (the more polished version; `bulk-create-discounts.js` is an earlier draft):
```
node bulk2.js
```

To test the API directly with a single discount via curl, see `test.sh`.

## CSV Format

`discounts.csv` columns: `code`, `discount_type` (`percentage` or `fixed`), `discount_value`, `max_redemptions`, `valid_from`, `valid_until`, `ticket_type_ids`

- `discount_value` for `fixed` type is in dollars — the scripts convert to cents (×100) before sending to the API
- `ticket_type_ids` is a comma-separated list of TicketTailor ticket type IDs (e.g. `tt_5923623`)

## API Notes

- Auth: Basic auth with API key as username and empty password
- The API accepts `application/json` body (not form-encoded as shown in TicketTailor docs)
- `bulk2.js` wraps the payload in `{ data: payload }` — this was the key fix over `bulk-create-discounts.js`
