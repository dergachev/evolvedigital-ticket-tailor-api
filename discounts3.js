const axios = require('axios');
const qs = require('qs');
let data = qs.stringify({
  'booking_fee_percent': '99',
  'code': 'Maya99',
  'name': 'May 99% OFF (TEST)',
  'price_percent': '99',
  'ticket_types[]': 'tt_5923623',
  'type': 'percentage'
});

let config = {
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
  data : data
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(JSON.stringify(error.response?.data, null, 2) ?? error.message);
});
