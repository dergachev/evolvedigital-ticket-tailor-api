const axios = require('axios');
const qs = require('qs');
const fs = require('fs');
const csv = require('csv-parser');

const results = [];

fs.createReadStream('discount-codes.csv')
  .pipe(csv())
  .on('data', (row) => results.push(row))
  .on('end', async () => {
    for (const row of results) {
      const data = qs.stringify({
        'code': row.code,
        'name': `${row.code} ${row.percent}% OFF`,
        'price_percent': row.percent,
        'ticket_types[]': 'tt_5923623',
        'type': 'percentage'
      });

      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.tickettailor.com/v1/discounts',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        auth: {
          username: 'sk_12217_266705_d162ca0eba8347ece0ccfdf648efc849',
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
