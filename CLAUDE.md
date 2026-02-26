# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

Scripts for bulk-creating discount codes in TicketTailor via their REST API. Reads from a CSV file and POSTs each row as a discount to `https://api.tickettailor.com/v1/discounts`.

## Setup

Create `.env` with:
```
TICKET_TAILOR_API_KEY=sk_...
```

Install dependencies:
```
npm install
```

## Running

The main script is `create-discounts-from-csv.js`:
```
node create-discounts-from-csv.js
```

To test the API directly with a single discount via curl, see `test.sh`.

API page is https://developers.tickettailor.com/docs/api/update-discount-by-id

## CSV Format

`discount-codes.csv` columns: `code`, `percent`, `ticket_types`

- `ticket_types` is comma-separated list of TicketTailor ticket type IDs; quote the cell if multiple (e.g. `"tt_5923623,tt_1234567"`)
- Sends as `type: percentage` with `price_percent` set to the percent value

## API Notes

- Auth: Basic auth with API key as username and empty password
- Body is form-encoded (`application/x-www-form-urlencoded`)
- Multiple ticket types are sent as repeated `ticket_types[]` keys — use `qs.stringify` with `{ arrayFormat: 'brackets' }` (key `ticket_types` without brackets; don't use `indices: false` with a `ticket_types[]` key as it double-encodes the brackets and results in `tt_0`)
