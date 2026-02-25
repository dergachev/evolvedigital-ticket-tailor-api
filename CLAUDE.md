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

## CSV Format

`discount-codes.csv` columns: `code`, `percent`

- Sends as `type: percentage` with `price_percent` set to the percent value
- Hardcoded to ticket type `tt_5923623` (edit the script to change)

## API Notes

- Auth: Basic auth with API key as username and empty password
- Body is form-encoded (`application/x-www-form-urlencoded`)
