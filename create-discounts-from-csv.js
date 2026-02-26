const axios = require('axios');
const qs = require('qs');
const fs = require('fs');
const csv = require('csv-parser');

require("dotenv").config();

const API_KEY = process.env.TICKET_TAILOR_API_KEY;
if (!API_KEY) {
  console.error("Missing API key. Add it to .env file.");
  process.exit(1);
}


const results = [];

fs.createReadStream('discount-codes.csv')
  .pipe(csv())
  .on('data', (row) => results.push(row))
  .on('end', async () => {
    for (const row of results) {
      const ticketTypes = row.ticket_types.split(',').map(s => s.trim());
      const data = qs.stringify({
        'code': row.code,
        'name': `${row.code} ${row.percent}% OFF`,
        'price_percent': row.percent,
        'ticket_types': ticketTypes,
        'type': 'percentage'
      }, { arrayFormat: 'brackets' });

      const cyan = s => `\x1b[36m${s}\x1b[0m`;
      const yellow = s => `\x1b[33m${s}\x1b[0m`;
      console.log(cyan(`\n[${row.code}] POST https://api.tickettailor.com/v1/discounts`));
      console.log(yellow('payload object:'), { code: row.code, percent: row.percent, ticketTypes });
      console.log(yellow('serialized body:'), data);

      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.tickettailor.com/v1/discounts',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        auth: {
          username: API_KEY,
          password: ''
        },
        data
      };

      try {
        const response = await axios.request(config);
        console.log(`${row.code}: OK`, JSON.stringify(response.data));
      } catch (error) {
        console.error(`${row.code}: ERROR`, JSON.stringify(error.response?.data, null, 2) ?? error.message);
      }
    }
  });




    // const encodedKey = Buffer.from(`${API_KEY}:`).toString("base64");k
